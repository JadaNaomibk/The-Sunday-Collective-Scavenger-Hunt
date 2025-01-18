const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Endpoint to handle photo uploads
app.post('/upload/photo', upload.single('photo'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Endpoint to handle video uploads
app.post('/upload/video', upload.single('video'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Endpoint to retrieve all uploads
app.get('/get-uploads', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read uploads directory' });
    }

    const photos = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')).map(file => `/uploads/${file}`);
    const videos = files.filter(file => file.endsWith('.webm') || file.endsWith('.mp4')).map(file => `/uploads/${file}`);

    res.json({ photos, videos });
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});