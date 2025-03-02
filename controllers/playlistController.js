const playlistModel = require('../models/playlistModel');
const musicModel = require('../models/musicModel');

// Playlist controller functions
const playlistController = {
  // Initialize playlist tables if they don't exist
  initializeTables: async (req, res) => {
    try {
      await playlistModel.initializeTables();
      res.json({
        success: true,
        message: 'Playlist tables initialized'
      });
    } catch (error) {
      console.error('Error initializing playlist tables:', error);
      res.status(500).json({
        success: false,
        message: 'Error initializing playlist tables',
        error: error.message
      });
    }
  },

  // Get all playlists
  getAllPlaylists: async (req, res) => {
    try {
      const playlists = await playlistModel.getAllPlaylists();
      res.json({
        success: true,
        count: playlists.length,
        data: playlists
      });
    } catch (error) {
      console.error('Error fetching playlists:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching playlists',
        error: error.message
      });
    }
  },

  // Get playlist by ID with songs
  getPlaylistById: async (req, res) => {
    try {
      const { id } = req.params;
      const playlist = await playlistModel.getPlaylistById(id);
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }
      
      res.json({
        success: true,
        data: playlist
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching playlist',
        error: error.message
      });
    }
  },

  // Create a new playlist
  createPlaylist: async (req, res) => {
    try {
      const { name, created_by } = req.body;
      let { thumbnail } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Playlist name is required'
        });
      }
      
      // Use default thumbnail if not provided
      if (!thumbnail) {
        thumbnail = '/home/shin_chan/musicServer/Data/thumb/default_playlist.jpg';
      }
      
      const playlist = await playlistModel.createPlaylist({
        name,
        created_by: created_by || 'Anonymous',
        thumbnail
      });
      
      res.status(201).json({
        success: true,
        message: 'Playlist created successfully',
        data: playlist
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating playlist',
        error: error.message
      });
    }
  },

  // Add a song to a playlist
  addSongToPlaylist: async (req, res) => {
    try {
      const { playlistId, songId } = req.params;
      
      // Check if playlist exists
      const playlist = await playlistModel.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found'
        });
      }
      
      // Check if song exists
      const song = await musicModel.getSongById(songId);
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }
      
      const result = await playlistModel.addSongToPlaylist(playlistId, songId);
      
      res.status(201).json({
        success: true,
        message: 'Song added to playlist successfully',
        data: result
      });
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      res.status(error.message === 'Song already exists in this playlist' ? 409 : 500).json({
        success: false,
        message: 'Error adding song to playlist',
        error: error.message
      });
    }
  },

  // Remove a song from a playlist
  removeSongFromPlaylist: async (req, res) => {
    try {
      const { playlistId, songId } = req.params;
      
      const result = await playlistModel.removeSongFromPlaylist(playlistId, songId);
      
      res.json({
        success: true,
        message: 'Song removed from playlist successfully',
        data: result
      });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      res.status(error.message === 'Song not found in this playlist' ? 404 : 500).json({
        success: false,
        message: 'Error removing song from playlist',
        error: error.message
      });
    }
  },

  // Delete a playlist
  deletePlaylist: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await playlistModel.deletePlaylist(id);
      
      res.json({
        success: true,
        message: 'Playlist deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      res.status(error.message === 'Playlist not found' ? 404 : 500).json({
        success: false,
        message: 'Error deleting playlist',
        error: error.message
      });
    }
  }
};

module.exports = playlistController;