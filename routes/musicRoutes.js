const express = require('express');
const musicController = require('../controllers/musicController');
const { uploadMusic } = require('../utils/fileHandler');

const router = express.Router();

// GET routes
router.get('/', musicController.getSongs);
router.get('/emotions', musicController.getEmotions);
router.get('/search', musicController.searchSongs);
router.get('/play/:title', musicController.playSong);
router.get('/:id', musicController.getSongById);

// POST routes
router.post('/', uploadMusic.single('audioFile'), musicController.addSong);

// DELETE routes
router.delete('/:id', musicController.deleteSong);

module.exports = router;