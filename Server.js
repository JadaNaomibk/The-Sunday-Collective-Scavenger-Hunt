const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Endpoint to handle file uploads
app.post('/upload', upload.single('mediaFile'), (req, res) => {
    if (req.file) {
        res.send('File uploaded successfully!');
    } else {
        res.status(400).send('Error uploading file.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});