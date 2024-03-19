const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const port = 3000;

// Verbindung zu MongoDB
mongoose.connect('mongodb://localhost:27017/245', { useNewUrlParser: true, useUnifiedTopology: true });

// Mongoose-Modell für Dateiverwaltung
const fileSchema = new mongoose.Schema({
  originalName: String,
  storageName: String,
  uploadDate: { type: Date, default: Date.now },
  path: String,
});
const File = mongoose.model('File', fileSchema);

// Multer-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

// Statische Dateien bedienen
app.use(express.static('public'));

// Upload-Route
app.post('/upload', upload.single('datei'), async (req, res) => {
  try {
    const existingFile = await File.findOne({ originalName: req.file.originalname });
    if (existingFile) {
      return res.status(400).send('Datei mit gleichem Namen existiert bereits. Bitte umbenennen und erneut versuchen.');
    }
    const newFile = new File({
      originalName: req.file.originalname,
      storageName: req.file.filename,
      path: req.file.path,
    });
    await newFile.save();
    res.send('Datei erfolgreich hochgeladen!');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Root-Route für einfache Begrüßungsnachricht
app.get('/', (req, res) => {
  res.send('Willkommen zum Datei-Upload-Server! Bitte navigieren Sie zu /index.html, um eine Datei hochzuladen.');
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
