const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const musicRoutes = require('./routes/musicRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

// Set BASE_URL for converting file paths to URLs
// This can be overridden with environment variable
process.env.BASE_URL = process.env.BASE_URL || 'http://100.102.217.22:3000';
console.log(`Using BASE_URL: ${process.env.BASE_URL}`);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving (for music files and thumbnails)
// Use the relative paths in URL patterns
app.use('/music', express.static('/home/shin_chan/musicServer/Data'));
app.use('/thumbnails', express.static('/home/shin_chan/musicServer/Data/thumb'));

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

// Start server
app.listen(PORT, () => {
  console.log(`Music server is running on port ${PORT}`);
  console.log(`Music files available at: ${process.env.BASE_URL}/music`);
  console.log(`Thumbnails available at: ${process.env.BASE_URL}/thumbnails`);
});

module.exports = app;