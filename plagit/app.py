from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    # Simple mock logic
    result = {"plagiarism_score": 23, "matches": ["example.com"]}
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
