const db = require('../config/db');

// Music model functions
const musicModel = {
  // Add new song function at the top
  addSong: async (songData) => {
    const result = await db.query(
      'INSERT INTO songs (title, artist, album, duration, emotion, file_location, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        songData.title,
        songData.artist,
        songData.album,
        songData.duration,
        songData.emotion,
        songData.file_location,
        songData.thumbnail
      ]
    );
    return result.rows[0];
  },

  // Get all songs
  getAllSongs: async () => {
    const result = await db.query('SELECT * FROM songs ORDER BY title');
    return result.rows;
  },

  // Get songs by emotion
  getSongsByEmotion: async (emotion) => {
    const result = await db.query('SELECT * FROM songs WHERE emotion = $1 ORDER BY title', [emotion]);
    return result.rows;
  },

  // Get song by ID
  getSongById: async (id) => {
    const result = await db.query('SELECT * FROM songs WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Get song by title (for exact match)
  getSongByTitle: async (title) => {
    const result = await db.query('SELECT * FROM songs WHERE title = $1', [title]);
    return result.rows[0];
  },

  // Get song by file name
  getSongByFileName: async (fileName) => {
    const result = await db.query('SELECT * FROM songs WHERE file_location = $1', [fileName]);
    return result.rows[0];
  },

  // Search songs by keyword in title or artist
  searchSongs: async (keyword) => {
    const searchPattern = `%${keyword}%`; // SQL LIKE pattern
    const result = await db.query(
      'SELECT * FROM songs WHERE title ILIKE $1 OR artist ILIKE $1 ORDER BY title',
      [searchPattern]
    );
    return result.rows;
  },

  // Delete a song by ID
  deleteSong: async (id) => {
    // First, check if the song exists
    const checkResult = await db.query('SELECT * FROM songs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      throw new Error('Song not found');
    }
    
    // Delete the song
    const result = await db.query('DELETE FROM songs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Get available emotions
  getEmotions: async () => {
    const result = await db.query('SELECT DISTINCT emotion FROM songs ORDER BY emotion');
    return result.rows.map(row => row.emotion);
  }
};

module.exports = musicModel;