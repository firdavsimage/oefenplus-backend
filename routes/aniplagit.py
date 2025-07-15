from flask import Flask, request, jsonify
import os, tempfile
import docx2txt
import PyPDF2
from difflib import SequenceMatcher
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = tempfile.gettempdir()

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    elif ext == '.docx':
        return docx2txt.process(file_path)
    elif ext == '.pdf':
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text
    else:
        return ""

def check_plagiarism(text):
    # Bu yerda oddiy model ishlatilgan, real bazaga nisbatan solishtirish uchun sozlashingiz mumkin
    sample_corpus = [
        "Bu matn test uchun mo‘ljallangan.",
        "O‘zbekiston Respublikasining davlat tili – o‘zbek tilidir.",
        "Inson o‘zining taqdirini o‘zi belgilaydi."
    ]
    max_similarity = 0
    for sample in sample_corpus:
        similarity = SequenceMatcher(None, text, sample).ratio()
        max_similarity = max(max_similarity, similarity)
    return round(max_similarity * 100, 2)

@app.route('/api/check', methods=['POST'])
def check_file():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'Fayl topilmadi'}), 400
    filename = secure_filename(file.filename)
    temp_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(temp_path)
    try:
        extracted_text = extract_text(temp_path)
        if not extracted_text.strip():
            return jsonify({'error': 'Matn topilmadi'}), 400
        plagiarism_score = check_plagiarism(extracted_text)
        return jsonify({'plagiarism': plagiarism_score, 'text': extracted_text})
    finally:
        os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True)
