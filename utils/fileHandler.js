const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Set up storage for uploaded music files
const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/home/shin_chan/musicServer/Data';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename but sanitize it
    const originalName = file.originalname;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Add timestamp to prevent filename conflicts
    const timestamp = Date.now();
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

// Filter to accept only audio files
const audioFileFilter = (req, file, cb) => {
  // Accept only mp3, wav, flac, etc.
  if (file.mimetype.startsWith('audio/') || 
      ['.mp3', '.wav', '.flac', '.ogg', '.m4a'].includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

// Set up multer for music uploads
const uploadMusic = multer({
  storage: musicStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024  // 50MB limit
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