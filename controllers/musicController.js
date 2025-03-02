const fs = require('fs');
const path = require('path');
const musicModel = require('../models/musicModel');
const { extractMetadata } = require('../utils/metadataExtractor');

// Music controller functions
const musicController = {
  // Get all songs or filter by emotion
  getSongs: async (req, res) => {
    try {
      const { emotion } = req.query;
      let songs;
      
      if (emotion) {
        songs = await musicModel.getSongsByEmotion(emotion);
      } else {
        songs = await musicModel.getAllSongs();
      }
      
      res.json({
        success: true,
        count: songs.length,
        data: songs
      });
    } catch (error) {
      console.error('Error fetching songs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching songs',
        error: error.message
      });
    }
  },

  // Get song by ID
  getSongById: async (req, res) => {
    try {
      const { id } = req.params;
      const song = await musicModel.getSongById(id);
      
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }
      
      res.json({
        success: true,
        data: song
      });
    } catch (error) {
      console.error('Error fetching song:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching song',
        error: error.message
      });
    }
  },

  // Get song by title for playback
  playSong: async (req, res) => {
    try {
      const { title } = req.params;
      const song = await musicModel.getSongByTitle(decodeURIComponent(title));
      
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }
      
      // Return file location for the client to play
      res.json({
        success: true,
        data: {
          title: song.title,
          artist: song.artist,
          fileLocation: song.fileLocation,
          thumbnail: song.thumbnail
        }
      });
    } catch (error) {
      console.error('Error fetching song for playback:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching song for playback',
        error: error.message
      });
    }
  },

  // Search songs
  searchSongs: async (req, res) => {
    try {
      const { keyword } = req.query;
      
      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: 'Search keyword is required'
        });
      }
      
      const songs = await musicModel.searchSongs(keyword);
      
      res.json({
        success: true,
        count: songs.length,
        data: songs
      });
    } catch (error) {
      console.error('Error searching songs:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching songs',
        error: error.message
      });
    }
  },

  // Get available emotions
  getEmotions: async (req, res) => {
    try {
      const emotions = await musicModel.getEmotions();
      
      res.json({
        success: true,
        count: emotions.length,
        data: emotions
      });
    } catch (error) {
      console.error('Error fetching emotions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching emotions',
        error: error.message
      });
    }
  },

  // Add a new song
  addSong: async (req, res) => {
    try {
      // File upload is handled by multer middleware in routes
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file uploaded'
        });
      }
      
      const { emotion } = req.body;
      const uploadedFile = req.file;
      
      if (!emotion) {
        return res.status(400).json({
          success: false,
          message: 'Emotion tag is required'
        });
      }
      
      // Extract metadata from the uploaded file
      const metadata = await extractMetadata(uploadedFile.path);
      
      // Create thumbnail or use default
      let thumbnailPath = '/home/shin_chan/musicServer/Data/thumb/default.jpg';
      // Thumbnail logic would go here if provided by the client
      
      // Prepare song data
      const songData = {
        title: metadata.title || path.basename(uploadedFile.filename, path.extname(uploadedFile.filename)),
        artist: metadata.artist || 'Unknown',
        album: metadata.album || 'Unknown',
        duration: metadata.duration || '0',
        emotion: emotion,
        fileLocation: uploadedFile.path,
        thumbnail: thumbnailPath
      };
      
      // Add song to database
      const song = await musicModel.addSong(songData);
      
      res.status(201).json({
        success: true,
        message: 'Song added successfully',
        data: song
      });
    } catch (error) {
      console.error('Error adding song:', error);
      res.status(error.message === 'Song already exists in the database' ? 409 : 500).json({
        success: false,
        message: 'Error adding song',
        error: error.message
      });
    }
  },

  // Delete a song
  deleteSong: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get song details before deletion
      const song = await musicModel.getSongById(id);
      
      if (!song) {
        return res.status(404).json({
          success: false,
          message: 'Song not found'
        });
      }
      
      // Delete from database
      const deletedSong = await musicModel.deleteSong(id);
      
      // Optional: Delete physical files
      /*
      if (fs.existsSync(deletedSong.fileLocation)) {
        fs.unlinkSync(deletedSong.fileLocation);
      }
      if (deletedSong.thumbnail && fs.existsSync(deletedSong.thumbnail) && 
          !deletedSong.thumbnail.includes('default.jpg')) {
        fs.unlinkSync(deletedSong.thumbnail);
      }
      */
      
      res.json({
        success: true,
        message: 'Song deleted successfully',
        data: deletedSong
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting song',
        error: error.message
      });
    }
  }
};

module.exports = musicController;