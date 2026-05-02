const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure clips directory exists
const clipsDir = path.join(__dirname, 'clips');
if (!fs.existsSync(clipsDir)) {
  fs.mkdirSync(clipsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./clips.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clip_title TEXT NOT NULL,
      editor TEXT NOT NULL,
      clip_url TEXT,
      clip_file_name TEXT,
      timestamp TEXT NOT NULL
    )`);
  }
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'clips/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

app.post('/api/upload', upload.single('clip_file'), (req, res) => {
  try {
    const { clip_title, editor, clip_url } = req.body;
    const clip_file_name = req.file ? req.file.filename : null;

    if (!clip_title || !editor || (!clip_url && !clip_file_name)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timestamp = new Date().toISOString();

    db.run(`INSERT INTO uploads (clip_title, editor, clip_url, clip_file_name, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [clip_title, editor, clip_url, clip_file_name, timestamp],
      function(err) {
        if (err) {
          console.error('Error inserting data:', err.message);
          return res.status(500).json({ error: 'Failed to save upload: ' + err.message });
        }
        res.json({ message: 'Upload saved successfully!', id: this.lastID });
      });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.get('/api/uploads', (req, res) => {
  db.all(`SELECT * FROM uploads ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching uploads:', err.message);
      return res.status(500).json({ error: 'Failed to fetch uploads' });
    }
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});