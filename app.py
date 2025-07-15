from flask import Flask, jsonify
from routes.api import api_bp  # routes/api.py dan blueprintni import qilish

app = Flask(__name__)

# API Blueprintni ro‘yxatdan o‘tkazish
app.register_blueprint(api_bp, url_prefix="/api")

# Asosiy sahifa yo‘li
@app.route("/")
def home():
    return "OefenPlus Backend is working!"

# Serverni ishga tushurish
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
