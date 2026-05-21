import random
import hashlib
import smtplib
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlparse
from urllib.request import Request, urlopen
from flask import Blueprint, request, current_app
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash

from .extensions import db, mail
from .models import User,Alert,News

auth_bp = Blueprint("auth", __name__)
STREET_NAME_PLACEHOLDERS = {"Rua nao identificada", "Rua proxima nao encontrada"}
ALERT_EXPIRATION_HOURS = 6
SP_NEWS_FEED_URL = "https://news.google.com/rss/search?q=S%C3%A3o%20Paulo%20SP&hl=pt-BR&gl=BR&ceid=BR:pt-419"
NEWS_IMAGE_URLS = {
    "vermelho": "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=320&q=70",
    "amarelo": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=320&q=70",
    "verde": "https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=320&q=70",
}


def mail_error_response(context, error):
    error_type = type(error).__name__
    print(f"[{context}] erro ao enviar email ({error_type}): {error}", flush=True)

    if isinstance(error, smtplib.SMTPAuthenticationError):
        message = "Falha de autenticacao no email. Confira MAIL_USERNAME e MAIL_PASSWORD no Render."
    elif isinstance(error, smtplib.SMTPConnectError):
        message = "Falha ao conectar no servidor SMTP. Confira MAIL_SERVER, MAIL_PORT, TLS e SSL."
    elif isinstance(error, smtplib.SMTPRecipientsRefused):
        message = "O servidor SMTP recusou o destinatario."
    elif isinstance(error, smtplib.SMTPSenderRefused):
        message = "O servidor SMTP recusou o remetente. Confira MAIL_USERNAME."
    else:
        message = "Erro ao enviar e-mail"

    return {
        "message": message,
        "error": f"{error_type}: {error}",
    }, 500


def send_email_message(message, context):
    if current_app.config.get("EMAILJS_SERVICE_ID"):
        return send_emailjs_email(message, context)

    if current_app.config.get("RESEND_API_KEY"):
        return send_resend_email(message, context)

    mail.send(message)


def send_emailjs_email(message, context):
    required_config = (
        "EMAILJS_SERVICE_ID",
        "EMAILJS_TEMPLATE_ID",
        "EMAILJS_PUBLIC_KEY",
    )
    missing_config = [key for key in required_config if not current_app.config.get(key)]

    if missing_config:
        raise RuntimeError(f"Configuracao EmailJS ausente: {', '.join(missing_config)}")

    recipients = message.recipients or []
    recipient = recipients[0] if recipients else ""

    if not recipient:
        raise RuntimeError("EmailJS precisa de pelo menos um destinatario")

    otp_match = re.search(r"\b\d{6}\b", message.body or "")
    otp = otp_match.group(0) if otp_match else ""

    payload = {
        "service_id": current_app.config["EMAILJS_SERVICE_ID"],
        "template_id": current_app.config["EMAILJS_TEMPLATE_ID"],
        "user_id": current_app.config["EMAILJS_PUBLIC_KEY"],
        "template_params": {
            "to_email": recipient,
            "email": recipient,
            "recipient": recipient,
            "subject": message.subject,
            "message": message.body or "",
            "text": message.body or "",
            "html": message.html or "",
            "otp": otp,
            "code": otp,
            "codigo": otp,
            "passcode": otp,
            "otp_code": otp,
            "verification_code": otp,
            "one_time_password": otp,
            "company_name": "AlertaSP",
            "app_name": "AlertaSP",
            "expires_in": "10 minutos",
            "time": "10 minutos",
            "from_name": "AlertaSP",
        },
    }

    if current_app.config.get("EMAILJS_PRIVATE_KEY"):
        payload["accessToken"] = current_app.config["EMAILJS_PRIVATE_KEY"]

    request_data = Request(
        "https://api.emailjs.com/api/v1.0/email/send",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "AlertaSP/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(request_data, timeout=15) as response:
            response_payload = response.read().decode("utf-8")
    except HTTPError as error:
        error_payload = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"EmailJS API retornou {error.code}: {error_payload}") from error

    print(f"[{context}] email enviado via EmailJS: {response_payload}", flush=True)


def send_resend_email(message, context):
    sender = current_app.config.get("RESEND_FROM_EMAIL") or message.sender
    recipients = message.recipients
    test_recipient = current_app.config.get("RESEND_TEST_RECIPIENT")

    if not sender:
        raise RuntimeError("RESEND_FROM_EMAIL ou MAIL_USERNAME precisa estar configurado")

    subject = message.subject
    html = message.html
    body = message.body

    if test_recipient:
        original_recipients = ", ".join(recipients)
        recipients = [test_recipient]
        subject = f"[TESTE] {subject}"

        if body:
            body = f"Destinatario original: {original_recipients}\n\n{body}"

        if html:
            html = (
                f"<p><strong>Destinatario original:</strong> {original_recipients}</p>"
                f"{html}"
            )

    payload = {
        "from": sender,
        "to": recipients,
        "subject": subject,
    }

    if html:
        payload["html"] = html

    if body:
        payload["text"] = body

    request_data = Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {current_app.config['RESEND_API_KEY']}",
            "Content-Type": "application/json",
            "User-Agent": "AlertaSP/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(request_data, timeout=15) as response:
            response_payload = response.read().decode("utf-8")
    except HTTPError as error:
        error_payload = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Resend API retornou {error.code}: {error_payload}") from error

    print(f"[{context}] email enviado via Resend: {response_payload}", flush=True)


def test_otp_payload(otp):
    if current_app.config.get("RESEND_TEST_RECIPIENT") or current_app.config.get("EMAILJS_SERVICE_ID"):
        return {"test_otp": otp}

    return {}

# ===== FUNÇÃO AUXILIAR PARA GERAR OTP =====

def generate_otp_code():
    """Gera um código numérico de 6 dígitos como string"""
    return "".join([str(random.randint(0, 9)) for _ in range(6)])

# ================== REGISTER ==================

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json

        email = data.get("email")
        password = data.get("password")
        name = data.get("name")

        if not email or not password:
            return {"message": "Email e senha são obrigatórios"}, 400

        if User.query.filter_by(email=email).first():
            return {"message": "Email já cadastrado"}, 400

        # Criar hash da senha
        hashed_password = generate_password_hash(password)
        
        # Gerar OTP e Tempo de Expiração (10 minutos)
        otp = generate_otp_code()
        expiry = datetime.utcnow() + timedelta(minutes=10)

        # Criar usuário
        new_user = User(
            email=email, 
            password=hashed_password,
            name=name,
            otp_code=otp,
            otp_expiry=expiry,
            is_verified=False
        )
        
        db.session.add(new_user)
        db.session.commit()

        # ===== ENVIO DO CÓDIGO POR EMAIL =====
        msg = Message(
            subject="🔐 Seu código de verificação - AlertaSP",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[email]
        )

        # Versão texto (fallback)
        msg.body = f"""
Olá,

Seu código de verificação é: {otp}

Ele expira em 10 minutos.

Se você não solicitou este código, ignore este e-mail.

Atenciosamente,  
Equipe SPAlerta
"""

        # Versão HTML (principal)
        msg.html = f"""
<div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; text-align: center;">

    <h2 style="color: #e53935; margin-bottom: 10px;">
      SP EM ALERTA
    </h2>

    <p style="color: #333; font-size: 16px;">
      Olá,
    </p>

    <p style="color: #555; font-size: 15px;">
      Use o código abaixo para confirmar sua conta:
    </p>

    <div style="margin: 30px 0;">
      <span style="
        display: inline-block;
        font-size: 32px;
        letter-spacing: 6px;
        font-weight: bold;
        color: #ffffff;
        background: #000000;
        padding: 15px 25px;
        border-radius: 10px;
      ">
        {otp}
      </span>
    </div>

    <p style="color: #777; font-size: 14px;">
      ⏳ Este código expira em <strong>10 minutos</strong>.
    </p>

    <p style="color: #e53935; font-size: 14px;">
      ⚠️ Nunca compartilhe este código com ninguém.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

    <p style="color: #999; font-size: 13px;">
      Se você não solicitou este código, ignore este e-mail.
    </p>

    <p style="color: #bbb; font-size: 12px; margin-top: 20px;">
      © 2026 AlertaSP
    </p>

  </div>
</div>
"""

        try:
            send_email_message(msg, "register")
            print(f"✅ Email enviado com sucesso para {email}")
        except Exception as e:
            return mail_error_response("register", e)

        return {
            "message": "Conta criada! Verifique o código enviado ao seu e-mail.",
            **test_otp_payload(otp),
        }, 201

    except Exception as e:
        print(f"❌ Erro no registro: {str(e)}")
        db.session.rollback()
        return {"message": f"Erro ao criar conta: {str(e)}"}, 500



# ================== VERIFICAR OTP ==================

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp_input = data.get("otp")

    print(f"[verify_otp] recebido email={email} otp={otp_input}")

    if not email or not otp_input:
        return {"message": "E-mail e código são necessários"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        print(f"[verify_otp] usuário não encontrado: {email}")
        return {"message": "Usuário não encontrado"}, 404

    if user.is_verified:
        print(f"[verify_otp] usuário já verificado: {email}")
        return {"message": "Este e-mail já foi verificado anteriormente."}, 200

    if datetime.utcnow() > user.otp_expiry:
        print(f"[verify_otp] código expirado para {email}: otp_expiry={user.otp_expiry}")
        return {"message": "O código expirou. Solicite um novo."}, 400

    if user.otp_code != otp_input:
        print(f"[verify_otp] código inválido para {email}: esperado={user.otp_code}, recebido={otp_input}")
        return {"message": "Código inválido"}, 400

    user.is_verified = True
    user.otp_code = None
    db.session.commit()

    print(f"[verify_otp] verificação concluída para {email}")
    return {"message": "E-mail confirmado com sucesso! Agora você pode fazer login."}, 200

# Reenvio 

@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.json
    email = data.get("email")

    print(f"[resend_otp] recebido email={email}")

    if not email:
        return {"message": "E-mail é necessário"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        print(f"[resend_otp] usuário não encontrado: {email}")
        return {"message": "Usuário não encontrado"}, 404

    otp = generate_otp_code()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    user.otp_code = otp
    user.otp_expiry = expiry
    db.session.commit()

    print(f"[resend_otp] novo OTP gerado para {email}: {otp}")

    msg = Message(
        subject="Novo código de verificação OTP",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[email]
    )

    msg.body = f"Seu novo código de confirmação é: {otp}\nEle expira em 10 minutos."
    
    try:
        send_email_message(msg, "resend_otp")
        print(f"[resend_otp] email enviado para {email}")
    except Exception as e:
        return mail_error_response("resend_otp", e)

    return {
        "message": "Novo código enviado com sucesso!",
        **test_otp_payload(otp),
    }, 200

# ================== LOGIN ==================

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuário não encontrado"}, 404

    if not user.is_verified:
        return {"message": "Por favor, verifique seu e-mail antes de logar."}, 403

    if not check_password_hash(user.password, password):
        return {"message": "Senha incorreta"}, 401

    return {"message": "Login realizado com sucesso", "user_id": user.id}

# ================== ESQUECI MINHA SENHA ==================

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return {"message": "E-mail e obrigatorio"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuario nao encontrado"}, 404

    otp = generate_otp_code()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    user.otp_code = otp
    user.otp_expiry = expiry
    db.session.commit()

    msg = Message(
        subject="Codigo para redefinir sua senha - AlertaSP",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[email]
    )

    msg.body = f"""
Ola,

Seu codigo para redefinir a senha e: {otp}

Ele expira em 10 minutos.

Se voce nao solicitou esta redefinicao, ignore este e-mail.

Equipe AlertaSP
"""

    msg.html = f"""
<div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; text-align: center;">
    <h2 style="color: #e53935; margin-bottom: 10px;">SP EM ALERTA</h2>
    <p style="color: #555; font-size: 15px;">Use o codigo abaixo para redefinir sua senha:</p>
    <div style="margin: 30px 0;">
      <span style="display: inline-block; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #ffffff; background: #000000; padding: 15px 25px; border-radius: 10px;">
        {otp}
      </span>
    </div>
    <p style="color: #777; font-size: 14px;">Este codigo expira em <strong>10 minutos</strong>.</p>
    <p style="color: #999; font-size: 13px;">Se voce nao solicitou esta redefinicao, ignore este e-mail.</p>
  </div>
</div>
"""

    try:
        send_email_message(msg, "forgot_password")
        print(f"[forgot_password] codigo enviado para {email}")
    except Exception as e:
        return mail_error_response("forgot_password", e)

    return {
        "message": "Codigo enviado para seu e-mail.",
        **test_otp_payload(otp),
    }, 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    otp_input = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp_input or not new_password:
        return {"message": "E-mail, codigo e nova senha sao obrigatorios"}, 400

    if len(new_password) < 6:
        return {"message": "A nova senha deve ter pelo menos 6 caracteres"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuario nao encontrado"}, 404

    if not user.otp_code or not user.otp_expiry:
        return {"message": "Solicite um novo codigo de redefinicao"}, 400

    if datetime.utcnow() > user.otp_expiry:
        return {"message": "O codigo expirou. Solicite um novo."}, 400

    if user.otp_code != otp_input:
        return {"message": "Codigo invalido"}, 400

    user.password = generate_password_hash(new_password)
    user.otp_code = None
    user.otp_expiry = None
    user.is_verified = True
    db.session.commit()

    return {"message": "Senha redefinida com sucesso."}, 200

from flask import request, jsonify
from .models import Alert
from .extensions import db


@auth_bp.route("/alert", methods=["POST"])
def create_alert():
    data = request.get_json(silent=True) or {}

    try:
        latitude = float(data.get("latitude"))
        longitude = float(data.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({"message": "Latitude e longitude validas sao obrigatorias"}), 400

    if latitude < -90 or latitude > 90 or longitude < -180 or longitude > 180:
        return jsonify({"message": "Coordenadas fora do intervalo permitido"}), 400

    title = str(data.get("title") or "Alerta").strip() or "Alerta"
    description = str(data.get("description") or "").strip()
    street_name = str(data.get("street_name") or data.get("streetName") or "").strip()

    if not description:
        return jsonify({"message": "Escreva uma descricao para o alerta"}), 400

    if len(title) > 100:
        return jsonify({"message": "O titulo deve ter no maximo 100 caracteres"}), 400

    if len(description) > 255:
        return jsonify({"message": "A descricao deve ter no maximo 255 caracteres"}), 400

    if len(street_name) > 160:
        return jsonify({"message": "O nome da rua deve ter no maximo 160 caracteres"}), 400

    if not street_name:
        street_name = reverse_geocode_street(latitude, longitude)

    alert = Alert(
        latitude=latitude,
        longitude=longitude,
        street_name=street_name or None,
        title=title,
        description=description
    )

    db.session.add(alert)
    db.session.commit()
    return jsonify({
        "message": "Alerta criado com sucesso",
        "alert": alert_to_dict(alert)
    }), 201


@auth_bp.route("/alert", methods=["GET"])
def get_alerts():
    expiration_limit = datetime.utcnow() - timedelta(hours=ALERT_EXPIRATION_HOURS)
    alerts = (
        Alert.query
        .filter(Alert.created_at >= expiration_limit)
        .order_by(Alert.created_at.desc())
        .all()
    )
    return jsonify([alert_to_dict(alert) for alert in alerts]), 200


@auth_bp.route("/alert/<int:alert_id>/street", methods=["PATCH"])
def update_alert_street(alert_id):
    data = request.get_json(silent=True) or {}
    street_name = str(data.get("street_name") or data.get("streetName") or "").strip()

    if not is_resolved_street_name(street_name):
        return jsonify({"message": "Nome da rua valido e obrigatorio"}), 400

    if len(street_name) > 160:
        return jsonify({"message": "O nome da rua deve ter no maximo 160 caracteres"}), 400

    alert = db.session.get(Alert, alert_id)

    if not alert:
        return jsonify({"message": "Alerta nao encontrado"}), 404

    alert.street_name = street_name
    db.session.commit()

    return jsonify({"alert": alert_to_dict(alert)}), 200


@auth_bp.route("/reverse-geocode", methods=["GET"])
def reverse_geocode():
    try:
        latitude = float(request.args.get("latitude"))
        longitude = float(request.args.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({"message": "Latitude e longitude validas sao obrigatorias"}), 400

    if latitude < -90 or latitude > 90 or longitude < -180 or longitude > 180:
        return jsonify({"message": "Coordenadas fora do intervalo permitido"}), 400

    street_name = reverse_geocode_street(latitude, longitude)
    alert_id = request.args.get("alert_id")

    if street_name and alert_id:
        try:
            alert = db.session.get(Alert, int(alert_id))
        except (TypeError, ValueError):
            alert = None

        if alert and not is_resolved_street_name(alert.street_name):
            alert.street_name = street_name
            db.session.commit()

    return jsonify({"street_name": street_name}), 200


def reverse_geocode_street(latitude, longitude):
    for zoom in (18, 17, 16):
        params = urlencode({
            "format": "jsonv2",
            "addressdetails": 1,
            "accept-language": "pt-BR",
            "lat": latitude,
            "lon": longitude,
            "zoom": zoom,
        })
        url = f"https://nominatim.openstreetmap.org/reverse?{params}"
        request_data = Request(
            url,
            headers={
                "User-Agent": "AlertaSP/1.0 reverse-geocode",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(request_data, timeout=4) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            print(f"[reverse_geocode] falha ao buscar rua: {error}")
            continue

        street_name = extract_street_name(payload)

        if street_name:
            return street_name[:160]

    return ""


def is_resolved_street_name(street_name):
    clean_street_name = str(street_name or "").strip()
    return bool(clean_street_name) and clean_street_name not in STREET_NAME_PLACEHOLDERS


def extract_street_name(payload):
    address = payload.get("address") or {}

    street = (
        address.get("road")
        or address.get("pedestrian")
        or address.get("footway")
        or address.get("cycleway")
        or address.get("path")
        or address.get("residential")
        or address.get("square")
    )
    number = address.get("house_number")

    if street:
        return ", ".join([part for part in (street, number) if part])

    fallback_parts = [
        address.get("neighbourhood"),
        address.get("suburb"),
        address.get("city_district"),
        address.get("city"),
    ]
    fallback = ", ".join([part for part in fallback_parts if part])

    if fallback:
        return fallback

    display_name = payload.get("display_name") or ""
    return ", ".join(display_name.split(",")[:2]).strip()


def alert_to_dict(alert):
    return {
        "id": alert.id,
        "latitude": alert.latitude,
        "longitude": alert.longitude,
        "street_name": alert.street_name,
        "title": alert.title,
        "description": alert.description,
        "created_at": alert.created_at.isoformat() if alert.created_at else None
    }
# ===================NEWS==============

@auth_bp.route("/news", methods=["GET"])
def get_news():
    nivel = request.args.get("nivel")
    regiao = request.args.get("regiao")

    live_news = fetch_sp_news()

    if nivel:
        live_news = [item for item in live_news if nivel.lower() in item["nivel"].lower()]

    if regiao:
        live_news = [item for item in live_news if regiao.lower() in item["regiao"].lower()]

    if live_news:
        return jsonify(live_news[:20]), 200

    query = News.query

    if nivel:
        query = query.filter(News.nivel.ilike(f"%{nivel}%"))

    if regiao:
        query = query.filter(News.regiao.ilike(f"%{regiao}%"))

    noticias = query.order_by(News.created_at.desc()).limit(20).all()

    return jsonify([n.to_dict() for n in noticias]), 200


def fetch_sp_news():
    request_data = Request(
        SP_NEWS_FEED_URL,
        headers={
            "User-Agent": "AlertaSP/1.0 news-reader",
            "Accept": "application/rss+xml, application/xml, text/xml",
        },
    )

    try:
        with urlopen(request_data, timeout=6) as response:
            payload = response.read()
    except (HTTPError, URLError, TimeoutError) as error:
        print(f"[news] falha ao buscar noticias externas: {error}")
        return []

    try:
        root = ET.fromstring(payload)
    except ET.ParseError as error:
        print(f"[news] falha ao ler RSS: {error}")
        return []

    news = []

    for index, item in enumerate(root.findall("./channel/item"), start=1):
        raw_title = clean_news_text(item.findtext("title"))
        title, source = split_google_news_title(raw_title)
        source_element = item.find("source")
        source_url = source_element.get("url") if source_element is not None else ""
        description = clean_news_text(item.findtext("description"))
        link = clean_news_text(item.findtext("link"))
        published_at = parse_news_date(item.findtext("pubDate"))

        if not title:
            continue

        stable_id = hashlib.sha1((link or title).encode("utf-8")).hexdigest()[:12]
        level = infer_news_level(f"{title} {description}")

        news.append({
            "id": f"sp-news-{index}-{stable_id}",
            "titulo": title[:150],
            "descricao": (description or "Noticia de Sao Paulo publicada recentemente.")[:255],
            "nivel": level,
            "regiao": "Sao Paulo",
            "fonte": source or "Google Noticias",
            "imagem": get_news_image(level, source_url),
            "link": link,
            "data": published_at,
        })

    return news


def clean_news_text(value):
    text = unescape(str(value or ""))
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def split_google_news_title(title):
    if " - " not in title:
        return title, "Google Noticias"

    headline, source = title.rsplit(" - ", 1)
    return headline.strip(), source.strip()


def parse_news_date(value):
    if not value:
        return None

    try:
        date = parsedate_to_datetime(value)
    except (TypeError, ValueError):
        return None

    return date.strftime("%d/%m/%Y %H:%M")


def infer_news_level(text):
    lowered = text.lower()
    red_keywords = ("morte", "mortes", "tiroteio", "incendio", "incêndio", "desabamento", "alagamento", "temporal", "acidente", "interditado")
    yellow_keywords = ("chuva", "alerta", "risco", "transito", "trânsito", "metro", "metrô", "cptm", "ônibus", "onibus", "greve", "operação", "operacao")

    if any(keyword in lowered for keyword in red_keywords):
        return "vermelho"

    if any(keyword in lowered for keyword in yellow_keywords):
        return "amarelo"

    return "verde"


def get_news_image(level, source_url=""):
    parsed_url = urlparse(source_url or "")
    domain = parsed_url.netloc

    if domain:
        return f"https://www.google.com/s2/favicons?domain={quote(domain)}&sz=128"

    return NEWS_IMAGE_URLS.get(level, NEWS_IMAGE_URLS["verde"])


@auth_bp.route("/reset-db", methods=["POST"])
def reset_db():
    # Rota para apagar todos os registros do banco de dados (uso de desenvolvimento)
    db.session.execute(Alert.__table__.delete())
    db.session.execute(User.__table__.delete())
    db.session.commit()
    return {"message": "Banco de dados limpo com sucesso."}, 200
