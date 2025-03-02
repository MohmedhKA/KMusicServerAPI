const express = require('express');
const playlistController = require('../controllers/playlistController');
const { uploadThumbnail } = require('../utils/fileHandler');

const router = express.Router();

// Initialize tables
router.post('/init-tables', playlistController.initializeTables);

// GET routes
router.get('/', playlistController.getAllPlaylists);
router.get('/:id', playlistController.getPlaylistById);

// POST routes
router.post('/', playlistController.createPlaylist);
router.post('/:playlistId/songs/:songId', playlistController.addSongToPlaylist);

// DELETE routes
router.delete('/:id', playlistController.deletePlaylist);
router.delete('/:playlistId/songs/:songId', playlistController.removeSongFromPlaylist);

module.exports = router;