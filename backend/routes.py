import random
from datetime import datetime, timedelta
from flask import Blueprint, request, current_app
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash

from .extensions import db, mail
from .models import User

auth_bp = Blueprint("auth", __name__)

# ===== FUNÇÃO AUXILIAR PARA GERAR OTP =====

def generate_otp_code():
    """Gera um código numérico de 6 dígitos como string"""
    return "".join([str(random.randint(0, 9)) for _ in range(6)])

# ================== REGISTER ==================

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"message": "Email e senha são obrigatórios"}, 400

    if User.query.filter_by(email=email).first():
        return {"message": "Email já cadastrado"}, 400

    # Criar hash da senha
    hashed_password = generate_password_hash(password)
    
    # Gerar OTP e Tempo de Expiração (10 minutos)
    otp = generate_otp_code()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    # Criar usuário (Certifique-se que seu Model tem os campos otp_code e otp_expiry)
    new_user = User(
        email=email, 
        password=hashed_password,
        otp_code=otp,
        otp_expiry=expiry,
        is_verified=False
    )
    
    db.session.add(new_user)
    db.session.commit()

    # ===== ENVIO DO CÓDIGO POR EMAIL =====
    # msg = Message(
    #     subject="Seu código de verificação OTP",
    #     sender=current_app.config["MAIL_USERNAME"],
    #     recipients=[email]
    # )

    # msg.body = f"Seu código de confirmação é: {otp}\nEle expira em 10 minutos."
    
    # try:
    #     mail.send(msg)
    # except Exception as e:
    #     return {"message": "Erro ao enviar e-mail, mas conta criada.", "error": str(e)}, 500

    # return {"message": "Conta criada! Verifique o código enviado ao seu e-mail."}, 201

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
    except Exception as e:
        return {"message": "Erro ao enviar e-mail, mas conta criada.", "error": str(e)}, 500

    return {"message": "Conta criada! Verifique o código enviado ao seu e-mail."}, 201



# ================== VERIFICAR OTP ==================

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp_input = data.get("otp")

    if not email or not otp_input:
        return {"message": "E-mail e código são necessários"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuário não encontrado"}, 404

    # 1. Verificar se já está verificado
    if user.is_verified:
        return {"message": "Este e-mail já foi verificado anteriormente."}, 200

    # 2. Verificar se o código expirou
    if datetime.utcnow() > user.otp_expiry:
        return {"message": "O código expirou. Solicite um novo."}, 400

    # 3. Comparar os códigos
    if user.otp_code != otp_input:
        return {"message": "Código inválido"}, 400

    # Sucesso: Ativa o usuário e limpa o código do banco
    user.is_verified = True
    user.otp_code = None 
    db.session.commit()

    return {"message": "E-mail confirmado com sucesso! Agora você pode fazer login."}, 200

# Reenvio 

@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.json
    email = data.get("email")

    if not email:
        return {"message": "E-mail é necessário"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuário não encontrado"}, 404

    # Gerar novo OTP
    otp = generate_otp_code()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    # Atualizar no banco
    user.otp_code = otp
    user.otp_expiry = expiry
    db.session.commit()

    # Enviar email
    msg = Message(
        subject="Novo código de verificação OTP",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[email]
    )

    msg.body = f"Seu novo código de confirmação é: {otp}\nEle expira em 10 minutos."
    
    try:
        mail.send(msg)
    except Exception as e:
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