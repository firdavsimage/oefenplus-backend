const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'uploads');
const compressDir = path.join(__dirname, 'compressed');
[uploadDir, compressDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.post('/compress', upload.single('file'), (req, res) => {
  const inputPath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const compressedPath = path.join(compressDir, 'compressed-' + Date.now() + ext);

  const sendFile = () => {
    res.download(compressedPath, 'compressed-' + req.file.originalname, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(compressedPath);
    });
  };

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    exec(`convert "${inputPath}" -strip -interlace Plane -gaussian-blur 0.05 -quality 75 "${compressedPath}"`, (err) => {
      if (err) return res.status(500).send('Siqishda xatolik');
      sendFile();
    });
  } else {
    fs.unlinkSync(inputPath);
    res.status(400).send('Faqat rasm (.jpg/.png) qabul qilinadi.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Render server ishlayapti: http://localhost:${PORT}`);
});
