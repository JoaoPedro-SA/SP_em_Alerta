import os
from pathlib import Path

from flask import abort, send_file
from flask_cors import CORS
from sqlalchemy import text
from dotenv import load_dotenv
load_dotenv()

from backend import create_app
from backend.extensions import db

app = create_app()
APK_PATH = Path(__file__).resolve().parent / "downloads" / "application-f5320877-f89e-4a44-9f7d-d15e2d45ffc5.apk"

cors_origins = [
    "http://localhost:19006",
    "http://192.168.15.25:19006",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://192.168.15.25:8081",
    "http://192.168.15.25:8082",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
]

frontend_urls = [
    os.getenv("FRONTEND_URL"),
    *os.getenv("FRONTEND_URLS", "").split(","),
]

for frontend_url in frontend_urls:
    if frontend_url:
        cors_origins.append(frontend_url.strip().rstrip("/"))

# Configurar CORS com múltiplas origens
CORS(app, 
     supports_credentials=True,
     origins=cors_origins,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


@app.get("/health")
@app.get("/health/db")
def health_check():
    try:
        db.session.execute(text("SELECT 1")).scalar()
        return {"status": "ok", "database": "ok"}, 200
    except Exception as error:
        db.session.rollback()
        return {
            "status": "error",
            "database": "error",
            "message": str(error),
        }, 503


@app.get("/")
@app.get("/download")
def download_page():
    return """
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SP em Alerta</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: #f5f7fb;
        color: #151923;
      }
      main {
        width: min(520px, calc(100% - 32px));
        padding: 32px;
        background: #ffffff;
        border: 1px solid #dce2ea;
        border-radius: 8px;
        box-shadow: 0 16px 40px rgba(21, 25, 35, 0.08);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }
      p {
        margin: 0 0 24px;
        line-height: 1.5;
        color: #4a5568;
      }
      a {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-height: 48px;
        padding: 0 20px;
        border-radius: 6px;
        background: #d71920;
        color: #ffffff;
        text-decoration: none;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>SP em Alerta</h1>
      <p>Baixe o app Android e instale no celular.</p>
      <a href="/download/app">Baixar APK</a>
    </main>
  </body>
</html>
"""


@app.get("/download/app")
def download_app():
    if not APK_PATH.exists():
        abort(404, description="APK file not found")

    return send_file(
        APK_PATH,
        mimetype="application-f5320877-f89e-4a44-9f7d-d15e2d45ffc5",
        as_attachment=True,
        download_name="AlertaSP-arm64-release.apk",
    )

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5001)))
