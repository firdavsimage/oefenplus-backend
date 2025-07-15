const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Fayl yuklash uchun papkalarni yaratish
const uploadDir = path.join(__dirname, 'uploads');
const compressDir = path.join(__dirname, 'compressed');
[uploadDir, compressDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Multer sozlamasi
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Statik frontend
app.use(express.static(path.join(__dirname, 'public')));

// Siqish endpointi
app.post('/compress', upload.single('file'), async (req, res) => {
  const inputPath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase();
  const compressedPath = path.join(compressDir, 'compressed-' + Date.now() + ext);

  // Siqish algoritmlari
  const cleanup = () => {
    fs.existsSync(inputPath) && fs.unlinkSync(inputPath);
    fs.existsSync(compressedPath) && fs.unlinkSync(compressedPath);
  };

  const sendFile = () => {
    res.download(compressedPath, 'compressed-' + originalName, cleanup);
  };

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    // ImageMagick bilan siqish
    exec(`convert "${inputPath}" -strip -interlace Plane -gaussian-blur 0.05 -quality 75 "${compressedPath}"`, (err) => {
      if (err) return res.status(500).send('Rasmni siqishda xatolik');
      sendFile();
    });

  } else if (ext === '.pdf') {
    // Ghostscript bilan PDF siqish
    exec(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile="${compressedPath}" "${inputPath}"`, (err) => {
      if (err) return res.status(500).send('PDF faylni siqishda xatolik');
      sendFile();
    });

  } else if (['.ppt', '.pptx', '.doc', '.docx'].includes(ext)) {
    const convertedPDF = inputPath.replace(ext, '.pdf');
    // LibreOffice orqali PDFga aylantirib, so‘ng siqish
    exec(`libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${uploadDir}"`, (err) => {
      if (err) return res.status(500).send('Faylni PDFga aylantirib bo‘lmadi');

      exec(`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile="${compressedPath}" "${convertedPDF}"`, (err) => {
        if (err) return res.status(500).send('PDF siqishda xatolik');
        fs.unlinkSync(convertedPDF); // PDF ni o‘chir
        sendFile();
      });
    });

  } else {
    fs.unlinkSync(inputPath);
    return res.status(400).send('Qo‘llab-quvvatlanmaydigan fayl turi');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
