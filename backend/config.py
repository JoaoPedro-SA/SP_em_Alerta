class Config:
    SECRET_KEY = "inserirSecretiKeyAqui"

    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = "alertasp@gmail"
    MAIL_PASSWORD = "7676587347"