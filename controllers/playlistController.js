const playlistModel = require('../models/playlistModel');
const musicModel = require('../models/musicModel');
const path = require('path');

// Base URL for the server
const BASE_URL = process.env.BASE_URL || 'http://100.102.217.22:3000';

// Function to convert playlist thumbnail path to URL
const convertPlaylistPath = (playlist) => {
  if (!playlist) return null;
  
  const playlistCopy = { ...playlist };
  
  // Convert thumbnail path to URL
  if (playlistCopy.thumbnail) {
    const thumbBasePath = '/home/shin_chan/musicServer/Data/thumb/';
    if (playlistCopy.thumbnail.startsWith(thumbBasePath)) {
      const relativePath = playlistCopy.thumbnail.substring(thumbBasePath.length);
      playlistCopy.thumbnailUrl = `${BASE_URL}/thumbnails/${encodeURIComponent(relativePath)}`;
    } else {
      playlistCopy.thumbnailUrl = `${BASE_URL}/thumbnails/${encodeURIComponent(path.basename(playlistCopy.thumbnail))}`;
    }
  }
  
  // If playlist has songs, convert their paths too
  if (playlistCopy.songs && Array.isArray(playlistCopy.songs)) {
    playlistCopy.songs = playlistCopy.songs.map(song => convertSongPath(song));
  }
  
  return playlistCopy;
};

// Function to convert song paths to URLs
const convertSongPath = (song) => {
  if (!song) return null;
  
  const songCopy = { ...song };
  
  // Convert file location to URL
  if (songCopy.fileLocation) {
    const musicBasePath = '/home/shin_chan/musicServer/Data/';
    if (songCopy.fileLocation.startsWith(musicBasePath)) {
      const relativePath = songCopy.fileLocation.substring(musicBasePath.length);
      songCopy.fileUrl = `${BASE_URL}/music/${encodeURIComponent(relativePath)}`;
    } else {
      songCopy.fileUrl = `${BASE_URL}/music/${encodeURIComponent(path.basename(songCopy.fileLocation))}`;
    }
  }
  
  // Convert thumbnail path to URL
  if (songCopy.thumbnail) {
    const thumbBasePath = '/home/shin_chan/musicServer/Data/thumb/';
    if (songCopy.thumbnail.startsWith(thumbBasePath)) {
      const relativePath = songCopy.thumbnail.substring(thumbBasePath.length);
      songCopy.thumbnailUrl = `${BASE_URL}/thumbnails/${encodeURIComponent(relativePath)}`;
    } else {
      songCopy.thumbnailUrl = `${BASE_URL}/thumbnails/${encodeURIComponent(path.basename(songCopy.thumbnail))}`;
    }
  }
  
  return songCopy;
};

// Convert an array of playlists
const convertArrayPlaylistsToUrls = (playlists) => {
  if (!playlists) return [];
  return playlists.map(playlist => convertPlaylistPath(playlist));
};

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
      
      // Convert local paths to URLs
      const playlistsWithUrls = convertArrayPlaylistsToUrls(playlists);
      
      res.json({
        success: true,
        count: playlistsWithUrls.length,
        data: playlistsWithUrls
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
      
      // Convert local paths to URLs
      const playlistWithUrls = convertPlaylistPath(playlist);
      
      res.json({
        success: true,
        data: playlistWithUrls
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
      
      // Convert local paths to URLs
      const playlistWithUrls = convertPlaylistPath(playlist);
      
      res.status(201).json({
        success: true,
        message: 'Playlist created successfully',
        data: playlistWithUrls
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
      
      // Convert local paths to URLs
      const resultWithUrls = convertPlaylistPath(result);
      
      res.json({
        success: true,
        message: 'Playlist deleted successfully',
        data: resultWithUrls
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