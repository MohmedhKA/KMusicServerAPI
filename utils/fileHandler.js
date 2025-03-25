const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure music storage
const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/home/shin_chan/musicServer/Data');
  },
  filename: (req, file, cb) => {
    // Remove timestamp, just use the original filename
    // Sanitize filename to remove special characters and spaces
    const sanitizedName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_');
    
    cb(null, sanitizedName);
  }
});

// Configure upload middleware
const uploadMusic = multer({
  storage: musicStorage,
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Handle thumbnail uploads for playlists
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/home/shin_chan/musicServer/Data/thumb';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename for thumbnail
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `playlist_${uniqueSuffix}${ext}`);
  }
});

// Filter to accept only image files
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Set up multer for thumbnail uploads
const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  }
});

module.exports = {
  uploadMusic,
  uploadThumbnail
};