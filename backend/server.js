const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware for static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Set up multer storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
  },
});

// Initialize multer with storage settings
const upload = multer({ storage });

// Endpoint to handle the photo upload
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', file: req.file });
});

// Endpoint to return a list of uploaded files
app.get('/uploads', (req, res) => {
  fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      res.status(500).json({ error: 'Failed to list files' });
    } else {
      res.json(files);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
