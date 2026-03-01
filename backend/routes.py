from flask import Blueprint, request, url_for, current_app
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import generate_password_hash, check_password_hash

from .extensions import db, mail
from .models import User

auth_bp = Blueprint("auth", __name__)


# ===== TOKEN =====

def generate_token(email):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt="email-confirm")


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.loads(token, salt="email-confirm", max_age=expiration)


# ================== REGISTER ==================

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    email = data["email"]
    password = generate_password_hash(data["password"])

    if User.query.filter_by(email=email).first():
        return {"message": "Email já cadastrado"}, 400

    user = User(email=email, password=password)
    db.session.add(user)
    db.session.commit()

    # ===== ENVIO DE EMAIL =====
    token = generate_token(email)
    link = url_for("auth.confirm_email", token=token, _external=True)

    msg = Message(
        subject="Confirme seu email",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[email]
    )

    msg.body = f"Clique no link para confirmar sua conta:\n{link}"
    mail.send(msg)

    return {"message": "Conta criada com sucesso e e-mail de confirmação enviado!"}, 201

# ================== CONFIRM EMAIL ==================

@auth_bp.route("/confirm/<token>")
def confirm_email(token):
    try:
        email = confirm_token(token)
    except:
        return {"message": "Token inválido ou expirado"}, 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuário não encontrado"}, 404

    user.is_verified = True
    db.session.commit()

    return {"message": "Email confirmado com sucesso!"}


# ================== LOGIN ==================

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data["email"]
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"message": "Usuário não encontrado"}, 404

    if not user.is_verified:
        return {"message": "Confirme seu email antes de logar"}, 403

    if not check_password_hash(user.password, password):
        return {"message": "Senha incorreta"}, 401

    return {"message": "Login realizado com sucesso"}