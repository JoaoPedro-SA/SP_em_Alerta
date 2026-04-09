import os
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

from backend import create_app

app = create_app()

# Configurar CORS com múltiplas origens
CORS(app, 
     supports_credentials=True,
     origins=[
         "http://localhost:19006",
         "http://192.168.15.25:19006",
         "http://localhost:8081",
         "http://localhost:8082",
         "http://192.168.15.25:8081",
         "http://192.168.15.25:8082",
         "http://127.0.0.1:8081",
         "http://127.0.0.1:8082"
     ],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5001)))