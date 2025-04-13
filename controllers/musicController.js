const fs = require('fs');
const path = require('path');
const musicModel = require('../models/musicModel');
const mm = require('music-metadata');
const sharp = require('sharp');

// Base URL for the server
const BASE_URL = process.env.BASE_URL || 'https://100.102.217.22:3000';

// Base paths
const DATA_DIR = '/home/shin_chan/musicServer/Data';
const THUMB_DIR = path.join(DATA_DIR, 'thumb');
const DEFAULT_THUMBNAIL = path.join(THUMB_DIR, 'default.jpg');
const DEFAULT_THUMBNAIL_URL = 'default.jpg';

// Helper function to clean object for logging (remove binary data)
const cleanForLogging = (obj) => {
  if (!obj) return null;
  if (typeof obj !== 'object') return obj;
  
  const cleaned = { ...obj };
  
  // Remove binary data
  if (cleaned.image && cleaned.image.imageBuffer) {
    cleaned.image = { 
      ...cleaned.image,
      imageBuffer: '[Binary data]',
      data: '[Binary data]'
    };
  }
  
  return cleaned;
};

// Function to convert local file paths to accessible URLs
const convertPathsToUrls = (song) => {
  console.log('\n=== Converting Paths to URLs for song:', song ? song.title : 'N/A', '===');
  if (!song) {
    console.log('No song provided');
    return null;
  }
  
  const songCopy = { ...song };
  
  // Convert file location to URL with /api prefix
  if (songCopy.file_location) {
    const filename = path.basename(songCopy.file_location);
    songCopy.fileUrl = `${BASE_URL}/api/music/play/${encodeURIComponent(song.title)}`;
    console.log('Generated fileUrl:', songCopy.fileUrl);
  } else {
    console.log('No file_location found in song data');
  }
  
  // Convert thumbnail path to URL with /api prefix
  if (songCopy.thumbnail && songCopy.thumbnail !== DEFAULT_THUMBNAIL) {
    try {
      if (fs.existsSync(songCopy.thumbnail)) {
        const thumbnailFilename = path.basename(songCopy.thumbnail);
        songCopy.thumbnailUrl = `${BASE_URL}/api/thumbnails/${encodeURIComponent(thumbnailFilename)}`;
        console.log('Generated thumbnailUrl:', songCopy.thumbnailUrl);
      } else {
        console.warn('Thumbnail file does not exist:', songCopy.thumbnail);
        songCopy.thumbnail = DEFAULT_THUMBNAIL;
        songCopy.thumbnailUrl = `${BASE_URL}/api/thumbnails/${DEFAULT_THUMBNAIL_URL}`;
      }
    } catch (error) {
      console.error('Error checking thumbnail file:', error);
      songCopy.thumbnail = DEFAULT_THUMBNAIL;
      songCopy.thumbnailUrl = `${BASE_URL}/api/thumbnails/${DEFAULT_THUMBNAIL_URL}`;
    }
  } else {
    console.log('No thumbnail found or using default');
    songCopy.thumbnail = DEFAULT_THUMBNAIL;
    songCopy.thumbnailUrl = `${BASE_URL}/api/thumbnails/${DEFAULT_THUMBNAIL_URL}`;
  }
  
  console.log('Final converted song data:', songCopy);
  console.log('=== Path Conversion Complete ===\n');
  return songCopy;
};

// Convert an array of songs
const convertArrayPathsToUrls = (songs) => {
  if (!songs) return [];
  return songs.map(song => convertPathsToUrls(song));
};

// Add uploadSong function after the existing imports
const uploadSong = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    const metadata = await mm.parseFile(file.path);
    const title = metadata.common.title || path.basename(file.originalname, path.extname(file.originalname));

    // Check for existing song with same title
    const existingSong = await musicModel.getSongByTitle(title);
    if (existingSong) {
      // Delete the uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return res.status(409).json({
        success: false,
        message: 'Song with this title already exists',
        existingSong: convertPathsToUrls(existingSong)
      });
    }

    const emotion = req.body.emotion || 'Unknown'; // Get emotion from request body

    // Update final file path to be directly in DATA_DIR
    const finalFilePath = path.join(DATA_DIR, file.filename);
    
    // Move file if it's not already in the correct location
    if (file.path !== finalFilePath) {
      fs.renameSync(file.path, finalFilePath);
    }

    // Extract metadata
    const common = metadata.common;

    // Prepare song data
    const songData = {
      title: common.title || path.basename(file.originalname, path.extname(file.originalname)),
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      duration: metadata.format.duration ? metadata.format.duration.toFixed(2) : 0,
      emotion: emotion,
      file_location: finalFilePath,
      thumbnail: ''
    };

    // Handle thumbnail extraction
    if (common.picture && common.picture.length > 0) {
      const imageBuffer = common.picture[0].data;
      const thumbnailPath = path.join(THUMB_DIR, `${path.basename(file.filename, '.mp3')}.jpg`);
      
      // Ensure thumb directory exists
      if (!fs.existsSync(THUMB_DIR)) {
        fs.mkdirSync(THUMB_DIR, { recursive: true });
      }

      await sharp(imageBuffer)
        .resize(300, 300)
        .toFile(thumbnailPath);
      
      songData.thumbnail = thumbnailPath;
    } else {
      // Use default thumbnail
      songData.thumbnail = DEFAULT_THUMBNAIL;
    }

    // Save to database
    const savedSong = await musicModel.addSong(songData);
    
    // Convert paths to URLs for response
    const songWithUrls = convertPathsToUrls(savedSong);

    res.status(201).json({
      success: true,
      message: 'Song uploaded successfully',
      data: songWithUrls
    });

  } catch (error) {
    console.error('Error uploading song:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading song',
      error: error.message
    });
  }
};

// Music controller functions
const musicController = {
  // Get all songs with options for playlists
  getSongs: async (req, res) => {
    try {
      const { playlist } = req.query;
      const userId = req.user.userId;
      
      console.log('Getting songs for user:', userId, 'playlist:', playlist);
      
      let songs;
      if (playlist) {
        console.log('Fetching playlist songs for emotion:', playlist);
        songs = await musicModel.getSongsByEmotion(playlist);
      } else {
        console.log('Fetching all songs for user:', userId);
        songs = await musicModel.getAllSongs(userId);
      }

      if (!songs) {
        console.log('No songs found');
        return res.json({
          success: true,
          data: []
        });
      }

      console.log(`Found ${songs.length} songs`);
      
      // Convert paths to URLs
      const songsWithUrls = songs.map(song => {
        const filename = path.basename(song.file_location);
        const thumbnailFilename = song.thumbnail ? path.basename(song.thumbnail) : 'default.jpg';
        
        return {
          ...song,
          fileUrl: `${BASE_URL}/api/music/play/${encodeURIComponent(song.title)}`,
          thumbnailUrl: `${BASE_URL}/api/thumbnails/${encodeURIComponent(thumbnailFilename)}`
        };
      });

      res.json({
        success: true,
        data: songsWithUrls
      });
    } catch (error) {
      console.error('Error in getSongs:', error);
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
      
      // Convert local paths to URLs
      const songWithUrls = convertPathsToUrls(song);
      
      res.json({
        success: true,
        data: songWithUrls
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

  // Update playSong to serve the actual file
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

      // Check if file exists
      if (!fs.existsSync(song.file_location)) {
        return res.status(404).json({
          success: false,
          message: 'Audio file not found'
        });
      }

      // Get file stats
      const stat = fs.statSync(song.file_location);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(song.file_location, {start, end});
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg'
        });
        
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes'
        });
        
        fs.createReadStream(song.file_location).pipe(res);
      }
    } catch (error) {
      console.error('Error streaming song:', error);
      res.status(500).json({
        success: false,
        message: 'Error streaming song'
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
      
      // Convert local paths to URLs
      const songsWithUrls = convertArrayPathsToUrls(songs);
      
      res.json({
        success: true,
        count: songsWithUrls.length,
        data: songsWithUrls
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

      console.log('Deleting song:', {
        id: song.id,
        title: song.title,
        fileLocation: song.file_location,
        thumbnail: song.thumbnail
      });
      
      // Delete from database first
      const deletedSong = await musicModel.deleteSong(id);
      
      // Delete physical audio file
      if (fs.existsSync(song.file_location)) {
        try {
          await fs.promises.unlink(song.file_location);
          console.log('Successfully deleted audio file:', song.file_location);
        } catch (err) {
          console.error('Error deleting audio file:', err);
          // Continue with the operation even if file deletion fails
        }
      } else {
        console.log('Audio file not found:', song.file_location);
      }

      // Delete physical thumbnail file if it's not the default
      if (song.thumbnail && 
          fs.existsSync(song.thumbnail) && 
          !song.thumbnail.includes('default.jpg')) {
        try {
          await fs.promises.unlink(song.thumbnail);
          console.log('Successfully deleted thumbnail:', song.thumbnail);
        } catch (err) {
          console.error('Error deleting thumbnail:', err);
          // Continue with the operation even if file deletion fails
        }
      } else {
        console.log('Thumbnail is either default or not found:', song.thumbnail);
      }
      
      // Convert local paths to URLs for the response
      const deletedSongWithUrls = convertPathsToUrls(deletedSong);
      
      res.json({
        success: true,
        message: 'Song and associated files deleted successfully',
        data: deletedSongWithUrls
      });
    } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting song',
        error: error.message
      });
    }
  },

  // Add a new endpoint for serving thumbnails
  getThumbnail: async (req, res) => {
    try {
      const { filename } = req.params;
      console.log('Thumbnail request for:', filename);
      const thumbnailPath = path.join(THUMB_DIR, filename);
      
      console.log('Looking for thumbnail at:', thumbnailPath);
      if (!fs.existsSync(thumbnailPath)) {
        console.log(`Thumbnail not found: ${thumbnailPath}, serving default from: ${DEFAULT_THUMBNAIL}`);
        return res.sendFile(DEFAULT_THUMBNAIL);
      }
      
      console.log('Serving thumbnail from:', thumbnailPath);
      res.sendFile(thumbnailPath);
    } catch (error) {
      console.error('Error serving thumbnail:', error);
      console.log('Serving default thumbnail due to error');
      res.sendFile(DEFAULT_THUMBNAIL);
    }
  },

  // Add uploadSong to exports
  uploadSong
};

module.exports = musicController;