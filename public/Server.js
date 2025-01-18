const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mkv|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File upload only supports the following filetypes - ' + filetypes));
  },
});

// File upload endpoint
app.post('/upload', upload.array('mediaFiles', 10), (req, res) => {
  const username = req.body.username;
  const filesMetadata = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    username,
  }));

  const metadataPath = path.join(uploadDir, 'metadata.json');
  let metadata = [];
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath));
    } catch (err) {
      console.error('Error reading metadata file:', err);
      return res.status(500).send('Error reading metadata file.');
    }
  }

  metadata = metadata.concat(filesMetadata);

  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  } catch (err) {
    console.error('Error writing metadata file:', err);
    return res.status(500).send('Error writing metadata file.');
  }

  res.send('Files uploaded successfully!');
});

// List uploaded files
app.get('/files', (req, res) => {
  const metadataPath = path.join(uploadDir, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath));
      res.json(metadata);
    } catch (err) {
      console.error('Error reading metadata file:', err);
      res.status(500).send('Error reading metadata file.');
    }
  } else {
    res.json([]);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});