const db = require('../config/db');

// Playlist model functions
const playlistModel = {
  // Create tables if they don't exist
  initializeTables: async () => {
    try {
      // Check if tables exist
      const tablesExist = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'playlists'
        )`);
      
      if (!tablesExist.rows[0].exists) {
        // Create playlists table
        await db.query(`
          CREATE TABLE playlists (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            created_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            thumbnail TEXT
          )
        `);
        
        // Create playlist_songs table
        await db.query(`
          CREATE TABLE playlist_songs (
            id SERIAL PRIMARY KEY,
            playlist_id INT REFERENCES playlists(id) ON DELETE CASCADE,
            song_id INT REFERENCES songs(id) ON DELETE CASCADE,
            UNIQUE(playlist_id, song_id)
          )
        `);
        
        console.log('Playlist tables created successfully');
      }
    } catch (error) {
      console.error('Error initializing playlist tables:', error);
      throw error;
    }
  },

  // Get all playlists
  getAllPlaylists: async () => {
    const result = await db.query(`
      SELECT p.*, COUNT(ps.song_id) AS song_count 
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      GROUP BY p.id
      ORDER BY p.name
    `);
    return result.rows;
  },

  // Get playlist by ID
  getPlaylistById: async (id) => {
    const playlistResult = await db.query('SELECT * FROM playlists WHERE id = $1', [id]);
    
    if (playlistResult.rows.length === 0) {
      return null;
    }
    
    const playlist = playlistResult.rows[0];
    
    // Get songs in this playlist
    const songsResult = await db.query(`
      SELECT s.* 
      FROM songs s
      JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = $1
      ORDER BY s.title
    `, [id]);
    
    playlist.songs = songsResult.rows;
    return playlist;
  },

  // Create a new playlist
  createPlaylist: async (playlistData) => {
    const { name, created_by, thumbnail } = playlistData;
    
    const result = await db.query(
      'INSERT INTO playlists (name, created_by, thumbnail) VALUES ($1, $2, $3) RETURNING *',
      [name, created_by, thumbnail]
    );
    
    return result.rows[0];
  },

  // Add song to playlist
  addSongToPlaylist: async (playlistId, songId) => {
    try {
      const result = await db.query(
        'INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2) RETURNING *',
        [playlistId, songId]
      );
      return result.rows[0];
    } catch (error) {
      // Check if error is due to duplicate
      if (error.code === '23505') { // Unique violation in PostgreSQL
        throw new Error('Song already exists in this playlist');
      }
      throw error;
    }
  },

  // Remove song from playlist
  removeSongFromPlaylist: async (playlistId, songId) => {
    const result = await db.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING *',
      [playlistId, songId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Song not found in this playlist');
    }
    
    return result.rows[0];
  },

  // Delete a playlist
  deletePlaylist: async (id) => {
    // Check if playlist exists
    const checkResult = await db.query('SELECT * FROM playlists WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('Playlist not found');
    }
    
    // Delete the playlist (cascade will handle the playlist_songs entries)
    const result = await db.query('DELETE FROM playlists WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = playlistModel;