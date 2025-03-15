const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { uploadMusic } = require('../utils/fileHandler');
const path = require('path');
const { ensureHttps, generateUrl } = require('../utils/urlHelpers');

// Update any formatting function
const formatSong = (song) => {
  const fileUrl = generateUrl(song.file_location, 'music');
  const thumbnailUrl = generateUrl(song.thumbnail, 'thumbnails');
  
  return {
    ...song,
    fileUrl: ensureHttps(fileUrl),
    thumbnailUrl: ensureHttps(thumbnailUrl)
  };
};

// POST routes
router.post('/upload', uploadMusic.single('song'), musicController.uploadSong);

// GET routes
router.get('/', musicController.getSongs);
router.get('/emotions', musicController.getEmotions);
router.get('/search', musicController.searchSongs);
router.get('/play/:title', musicController.playSong);
router.get('/:id', musicController.getSongById);

// DELETE routes
router.delete('/:id', musicController.deleteSong);

module.exports = router;