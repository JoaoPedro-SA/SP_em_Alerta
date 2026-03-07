from .extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    # Novos campos para o OTP:
    otp_code = db.Column(db.String(8), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)