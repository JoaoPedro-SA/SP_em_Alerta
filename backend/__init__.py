import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from .extensions import db, mail
from .routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("backend.config.Config")

    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp)

    with app.app_context():
        db.create_all()

    return app