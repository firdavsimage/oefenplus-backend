const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mammoth = require('mammoth');
const PptxParser = require('pptx-parser');
const xlsx = require('xlsx');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, 'uploads');

// 📁 Fayl saqlash papkasini yaratish (agar mavjud bo‘lmasa)
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// 🔧 Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
const upload = multer({ dest: uploadsDir });

// 🔤 Kiril → Lotin funksiyasi (asosiy)
function krilToLatin(text) {
  return text
    .replace(/Ғ/g, "Gʻ").replace(/ғ/g, "gʻ")
    .replace(/Қ/g, "Q").replace(/қ/g, "q")
    .replace(/Ў/g, "Oʻ").replace(/ў/g, "oʻ")
    .replace(/Ҳ/g, "H").replace(/ҳ/g, "h")
    .replace(/Ё/g, "Yo").replace(/ё/g, "yo")
    .replace(/Ш/g, "Sh").replace(/ш/g, "sh")
    .replace(/Ч/g, "Ch").replace(/ч/g, "ch")
    .replace(/Ю/g, "Yu").replace(/ю/g, "yu")
    .replace(/Я/g, "Ya").replace(/я/g, "ya")
    .replace(/А/g, "A").replace(/а/g, "a")
    .replace(/Б/g, "B").replace(/б/g, "b")
    .replace(/В/g, "V").replace(/в/g, "v")
    .replace(/Г/g, "G").replace(/г/g, "g")
    .replace(/Д/g, "D").replace(/д/g, "d")
    .replace(/Е/g, "E").replace(/е/g, "e")
    .replace(/Ж/g, "J").replace(/ж/g, "j")
    .replace(/З/g, "Z").replace(/з/g, "z")
    .replace(/И/g, "I").replace(/и/g, "i")
    .replace(/Й/g, "Y").replace(/й/g, "y")
    .replace(/К/g, "K").replace(/к/g, "k")
    .replace(/Л/g, "L").replace(/л/g, "l")
    .replace(/М/g, "M").replace(/м/g, "m")
    .replace(/Н/g, "N").replace(/н/g, "n")
    .replace(/О/g, "O").replace(/о/g, "o")
    .replace(/П/g, "P").replace(/п/g, "p")
    .replace(/Р/g, "R").replace(/р/g, "r")
    .replace(/С/g, "S").replace(/с/g, "s")
    .replace(/Т/g, "T").replace(/т/g, "t")
    .replace(/У/g, "U").replace(/у/g, "u")
    .replace(/Ф/g, "F").replace(/ф/g, "f")
    .replace(/Х/g, "X").replace(/х/g, "x")
    .replace(/Ц/g, "Ts").replace(/ц/g, "ts")
    .replace(/Ь/g, "").replace(/ь/g, "")
    .replace(/Ъ/g, "").replace(/ъ/g, "");
}

// 📥 Matn orqali o‘girish
app.post('/api/convert-text', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Matn kiriting' });
  const converted = krilToLatin(text);
  res.json({ converted });
});

// 📤 Faylni yuklab, o‘girib, saqlab berish
app.post('/api/convert-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    const filePath = file.path;
    const outputFile = `${uuidv4()}.txt`;
    const outputPath = path.join(uploadsDir, outputFile);

    let content = "";

    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else if (ext === '.pptx') {
      const slides = await PptxParser.parse(filePath);
      content = slides.map(s => s.text).join('\n');
    } else if (ext === '.xlsx') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      content = xlsx.utils.sheet_to_csv(sheet);
    } else {
      return res.status(400).json({ error: 'Yaroqsiz fayl turi' });
    }

    const converted = krilToLatin(content);
    fs.writeFileSync(outputPath, converted, 'utf8');
    res.json({ downloadUrl: `/uploads/${outputFile}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Faylni o‘girishda xatolik' });
  }
});

// 🧹 Har 10 daqiqada eski fayllarni o‘chirish
cron.schedule('*/10 * * * *', () => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return;
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (!err && now - stats.mtimeMs > 10 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
