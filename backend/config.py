import os


def env_bool(name, default=False):
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


def mail_password():
    password = os.getenv("MAIL_PASSWORD")

    if not password:
        return password

    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip().lower()

    if mail_server == "smtp.gmail.com":
        return password.replace(" ", "")

    return password

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "sua-chave-secreta-aqui")
    

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///database.db").replace(
        "postgres://", "postgresql://"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com").strip()
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = env_bool("MAIL_USE_TLS", True)
    MAIL_USE_SSL = env_bool("MAIL_USE_SSL", False)
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "").strip() or None
    MAIL_PASSWORD = mail_password()
    MAIL_DEFAULT_SENDER = MAIL_USERNAME

    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
    RESEND_TEST_RECIPIENT = os.getenv("RESEND_TEST_RECIPIENT")
