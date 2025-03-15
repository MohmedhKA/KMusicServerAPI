const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');
const musicRoutes = require('./routes/musicRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

// Add this near the top of the file, after imports
if (!process.env.BASE_URL || process.env.BASE_URL.startsWith('http:')) {
  process.env.BASE_URL = 'https://100.102.217.22:3000';
}

// Read SSL certificate files
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, '../certficate/cert.pem')),
  key: fs.readFileSync(path.join(__dirname, '../certficate/key.pem'))
};

// Set BASE_URL for converting file paths to URLs
// Update to use HTTPS
process.env.BASE_URL = process.env.BASE_URL || 'https://100.102.217.22:3000';
console.log(`Using BASE_URL: ${process.env.BASE_URL}`);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Add this before any route handlers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://100.102.217.22:3001');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// Replace existing CORS middleware
app.use(cors({
  origin: 'https://100.102.217.22:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add this before your routes
app.use((req, res, next) => {
  if (req.body) {
    // Convert any HTTP URLs to HTTPS in request body
    const convertToHttps = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('http:')) {
          obj[key] = obj[key].replace('http:', 'https:');
        } else if (typeof obj[key] === 'object') {
          convertToHttps(obj[key]);
        }
      }
    };
    convertToHttps(req.body);
  }
  next();
});

// Static file serving (for music files and thumbnails)
app.use('/music', express.static('/home/shin_chan/musicServer/Data', {
  setHeaders: (res, path) => {
    res.set('Accept-Ranges', 'bytes');
    res.set('Content-Security-Policy', "upgrade-insecure-requests");
    if (path.endsWith('.mp3')) {
      res.set('Content-Type', 'audio/mpeg');
    }
  }
}));

app.use('/thumbnails', express.static('/home/shin_chan/musicServer/Data/thumb', {
  setHeaders: (res) => {
    res.set('Content-Security-Policy', "upgrade-insecure-requests");
  }
}));

// Routes
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: true, 
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Create HTTPS server instead of HTTP
const server = https.createServer(httpsOptions, app);

// Update server start to use HTTPS
server.listen(PORT, () => {
  console.log(`Music server is running on HTTPS port ${PORT}`);
  console.log(`Music files available at: ${process.env.BASE_URL}/music`);
  console.log(`Thumbnails available at: ${process.env.BASE_URL}/thumbnails`);
});

module.exports = app;