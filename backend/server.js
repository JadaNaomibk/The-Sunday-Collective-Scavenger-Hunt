const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware for static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Admin authentication middleware (simple example)
const isAdmin = (req, res, next) => {
  // Here you can implement a more sophisticated authentication method
  // For now, we'll just simulate admin authentication using a query parameter
  if (req.query.admin === 'true') {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized access' });
};

// Endpoint to handle the photo/video upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Respond with the file URL for use in the frontend
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'File uploaded successfully', fileUrl });
});

// Endpoint to return a list of uploaded files (accessible only by admins)
app.get('/admin/uploads', isAdmin, (req, res) => {
  fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to list files' });
    }

    // Respond with a list of image/video files
    const mediaFiles = files.filter(file => /\.(jpg|jpeg|png|gif|mp4|mov)$/i.test(file));
    res.json(mediaFiles); // Sends an array of file names
  });
});

// Route to serve the homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to serve the admin page (admin.html)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Endpoint for saving player progress or data (example route)
app.post('/save-progress', express.json(), (req, res) => {
  const playerData = req.body; // Assuming data comes in the body of the request
  fs.writeFile('progress.json', JSON.stringify(playerData), (err) => {
    if (err) {
      console.error('Error saving progress:', err);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
    res.json({ message: 'Progress saved successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
