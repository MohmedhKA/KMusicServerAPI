const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { uploadMusic } = require('../utils/fileHandler');

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