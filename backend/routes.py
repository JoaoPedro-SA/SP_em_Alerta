import random
from datetime import datetime, timedelta
from flask import Blueprint, request, current_app
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash

from .extensions import db, mail
from .models import User,Alert,News

auth_bp = Blueprint("auth", __name__)

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
            mail.send(msg)
            print(f"✅ Email enviado com sucesso para {email}")
        except Exception as e:
            print(f"⚠️ Erro ao enviar email para {email}: {str(e)}")
            # Continua mesmo se o email falhar - o usuário já foi criado

        return {"message": "Conta criada! Verifique o código enviado ao seu e-mail."}, 201

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
        mail.send(msg)
        print(f"[resend_otp] email enviado para {email}")
    except Exception as e:
        print(f"[resend_otp] erro ao enviar email para {email}: {e}")
        return {"message": "Erro ao enviar e-mail", "error": str(e)}, 500

    return {"message": "Novo código enviado com sucesso!"}, 200

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

from flask import request, jsonify
from .models import Alert
from .extensions import db


@auth_bp.route("/alert", methods=["POST"])
def create_alert():
    data = request.get_json()

    alert = Alert(
        latitude=data['latitude'],
        longitude=data['longitude'],
        title=data.get('title', 'Alerta'),
        description=data.get('description')
    )

    db.session.add(alert)
    db.session.commit()
    return {"message": "Alerta criado com sucesso"}


@auth_bp.route("/alert", methods=["GET"])
def get_alerts():
    alerts = Alert.query.all()

    result = []
    for alert in alerts:
        result.append({
            "id": alert.id,
            "latitude": alert.latitude,
            "longitude": alert.longitude,
            "title": alert.title,
            "description": alert.description
        })

    return (result)

@auth_bp.route("/news" , methods=["POST"])
def create_news():
    data = request.get_json()
    
    news = News(
        titulo=data["titulo"],
        descricao=data["descricao"],
        nivel=data["nivel"],
        regiao=data["regiao"],
        fonte=data.get("fonte", "Sistema")
    )
    
    db.session.add(news)
    db.session.commit()
    
    return jsonify({"message":"Notícia criada com sucesso"}), 201

@auth_bp.route("/news", methods=["GET"])
def get_news():
    nivel = request.args.get("nivel")
    regiao = request.args.get("regiao")
    
    query = News.query
    
    if nivel:
        query = query.filter_by(nivel=nivel)
    
    if regiao:
        query = query.filter_by(regiao=regiao)
        
    noticias = query.order_by(News.created_at.desc()).all()
    return jsonify([n.to_dict() for n in noticias])

@auth_bp.route("/reset-db", methods=["POST"])
def reset_db():
    # Rota para apagar todos os registros do banco de dados (uso de desenvolvimento)
    db.session.execute(Alert.__table__.delete())
    db.session.execute(User.__table__.delete())
    db.session.commit()
    return {"message": "Banco de dados limpo com sucesso."}, 200