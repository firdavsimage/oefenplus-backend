// 📁 pdf-converter-backend/server.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const cron = require("node-cron");
const imageToPdf = require("image-to-pdf"); // <== Yangi kutubxona

const app = express();
const port = 3000;
const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

// 📁 papkalarni yaratish (agar mavjud bo'lmasa)
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// 📁 Fayl yuklash sozlamalari
const allowedExtensions = [".jpg", ".jpeg", ".png", ".docx", ".pptx"];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) cb(null, true);
  else cb(new Error("Ruxsat etilmagan fayl turi!"), false);
};
const upload = multer({ storage, fileFilter });

// 📦 Faylni PDFga aylantirish
app.post("/convert", upload.array("files"), async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "Hech qanday fayl yuborilmadi." });
  }

  const outputFile = path.join(outputDir, `${Date.now()}.pdf`);

  try {
    const imageFiles = files.filter(f =>
      [".jpg", ".jpeg", ".png"].includes(path.extname(f.originalname).toLowerCase())
    );
    const docFiles = files.filter(f =>
      [".docx", ".pptx"].includes(path.extname(f.originalname).toLowerCase())
    );

    if (imageFiles.length > 0) {
      // Rasmlarni PDF ga aylantirish
      const imagePaths = imageFiles.map(f => f.path);
      const output = fs.createWriteStream(outputFile);
      imageToPdf(imagePaths, 'A4').pipe(output);
      output.on("finish", () => {
        return res.download(outputFile);
      });

    } else if (docFiles.length === 1) {
      // Word yoki PowerPoint faylni LibreOffice orqali PDFga aylantirish
      const filePath = docFiles[0].path;
      exec(`libreoffice --headless --convert-to pdf --outdir ${outputDir} "${filePath}"`, (err) => {
        if (err) return res.status(500).json({ error: "LibreOffice xatolik berdi." });
        const convertedFile = path.join(outputDir, path.basename(filePath, path.extname(filePath)) + ".pdf");
        return res.download(convertedFile);
      });

    } else {
      return res.status(400).json({ error: "Faqat bitta DOCX yoki PPTX fayl yuboring yoki rasm fayllarni tanlang." });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Faylni qayta ishlashda xatolik yuz berdi." });
  }
});

// 🗑 Fayllarni har 10 daqiqada tozalash
cron.schedule("*/10 * * * *", () => {
  const now = Date.now();
  [uploadDir, outputDir].forEach(dir => {
    fs.readdir(dir, (err, files) => {
      if (err) return;
      files.forEach(file => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stats) => {
          if (!err && now - stats.mtimeMs > 10 * 60 * 1000) {
            fs.unlink(filePath, () => {});
          }
        });
      });
    });
  });
});

// ▶️ Serverni ishga tushirish
app.listen(port, () => {
  console.log(`✅ PDF Converter backend ishga tushdi: http://localhost:${port}`);
});
