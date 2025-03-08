const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const musicController = require('../controllers/musicController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/shin_chan/musicServer/Data/');  // Update this path to match your system
  },
  filename: function (req, file, cb) {
    // Preserve the original filename and append MP3_320K
    const originalName = path.parse(file.originalname);
    cb(null, `${originalName.name}(MP3_320K)${originalName.ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// GET routes
router.get('/', musicController.getSongs);
router.get('/emotions', musicController.getEmotions);
router.get('/search', musicController.searchSongs);
router.get('/play/:title', musicController.playSong);
router.get('/:id', musicController.getSongById);

// POST routes
router.post('/', upload.single('file'), musicController.addSong);

// DELETE routes
router.delete('/:id', musicController.deleteSong);

module.exports = router;