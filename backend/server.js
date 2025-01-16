const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure the 'uploads' folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create the folder and its parent directories if needed
  console.log('Uploads folder created');
}

// Middleware for static files
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir)); // Serve static files from 'uploads' folder

// Set up multer storage for uploaded images/videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique filenames
  },
});

// Initialize multer with storage settings
const upload = multer({ storage });

// Admin authentication middleware (simple example)
const isAdmin = (req, res, next) => {
  // Simulate admin authentication using a query parameter (e.g., ?admin=true)
  if (req.query.admin === 'true') {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized access' });
};

// In-memory storage for uploaded media metadata (player name and file info)
let uploadedMedia = []; // Store uploaded media metadata here

// Endpoint to handle the photo/video upload
app.post('/upload', upload.single('file'), (req, res) => {
  const { playerName } = req.body; // Assuming the username is sent with the file
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Save the media data with player name and file type
  const mediaData = {
    filename: file.filename,
    playerName: playerName,
    type: file.mimetype.startsWith('image') ? 'image' : 'video',
  };

  uploadedMedia.push(mediaData); // Store uploaded media metadata

  res.status(200).json({ message: 'File uploaded successfully', fileUrl: `/uploads/${file.filename}` });
});

// Endpoint to return a list of uploaded files (accessible only by admins)
app.get('/admin/uploads', isAdmin, (req, res) => {
  // Respond with the list of media files and player names
  res.json(uploadedMedia); 
});

// Endpoint to serve the homepage (index.html)
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
