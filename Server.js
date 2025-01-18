const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const basicAuth = require('basic-auth');

const app = express();
const port = 3000;

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Basic authentication middleware
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (user && user.name === 'admin' && user.pass === 'password') {
    return next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    res.status(401).send('Authentication required.');
  }
};

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload photo
app.post('/upload/photo', upload.single('photo'), (req, res) => {
  res.send({ url: `/uploads/${req.file.filename}` });
});

// Upload video
app.post('/upload/video', upload.single('video'), (req, res) => {
  res.send({ url: `/uploads/${req.file.filename}` });
});

// Admin gallery view
app.get('/admin', auth, (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files.');
    }
    res.send(`
      <h1>Admin Gallery</h1>
      <div>
        ${files.map(file => `<div><a href="/uploads/${file}" target="_blank">${file}</a></div>`).join('')}
      </div>
    `);
  });
});

// Endpoint to get gallery photos
app.get('/gallery/photos', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files.');
    }
    const photos = files.filter(file => file.endsWith('.png'));
    res.json({ photos: photos.map(photo => `/uploads/${photo}`) });
  });
});

// Endpoint to get gallery videos
app.get('/gallery/videos', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files.');
    }
    const videos = files.filter(file => file.endsWith('.webm'));
    res.json({ videos: videos.map(video => `/uploads/${video}`) });
  });
});

// Clear gallery endpoint
app.post('/clear-gallery', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files.');
    }
    files.forEach(file => {
      fs.unlinkSync(path.join('uploads', file));
    });
    res.send('Gallery cleared.');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${5500}`);
});