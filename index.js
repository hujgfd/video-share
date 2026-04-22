const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = './uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }
});

app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('video'), (req, res) => {
  const { username } = req.body;
  const file = req.file;
  if (!file) return res.status(400).send('请选择视频');
  res.json({ success: true });
});

app.get('/videos', (req, res) => {
  const list = [];
  if (fs.existsSync(UPLOAD_DIR)) {
    const files = fs.readdirSync(UPLOAD_DIR);
    files.forEach(file => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, file));
      list.push({
        saveName: file,
        fileName: file,
        size: (stat.size / 1024 / 1024).toFixed(2) + 'MB',
        time: stat.mtime.toLocaleString()
      });
    });
  }
  res.json(list.reverse());
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
