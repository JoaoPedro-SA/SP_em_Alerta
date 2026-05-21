import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from sqlalchemy import inspect, text
from .extensions import db, mail
from .models import Alert
from .routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("backend.config.Config")

    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp)

    with app.app_context():
        db.create_all()
        ensure_alert_schema()

    return app


def ensure_alert_schema():
    inspector = inspect(db.engine)
    columns = {column["name"] for column in inspector.get_columns(Alert.__tablename__)}

    if "street_name" not in columns:
        db.session.execute(text("ALTER TABLE alert ADD COLUMN street_name VARCHAR(160)"))
        db.session.commit()
