from flask import Flask, jsonify
from flask_cors import CORS

# Modul importlar (har bir modul alohida fayl bo'lishi kerak)
from routes.pdf import pdf_blueprint
from routes.compress import compress_blueprint
from routes.krillotin import krillotin_blueprint
from routes.aniplagit import aniplagit_blueprint

app = Flask(__name__)
CORS(app)  # Render frontend bilan ishlashi uchun CORS kerak

# Blueprint'larni registratsiya qilish
app.register_blueprint(pdf_blueprint, url_prefix='/pdf')
app.register_blueprint(compress_blueprint, url_prefix='/compress')
app.register_blueprint(krillotin_blueprint, url_prefix='/krillotin')
app.register_blueprint(aniplagit_blueprint, url_prefix='/aniplagit')

@app.route('/')
def index():
    return jsonify({"message": "Oefenplus Backend ishga tushdi!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)  # Render port ixtiyoriy emas, lekin ko'pincha 10000
