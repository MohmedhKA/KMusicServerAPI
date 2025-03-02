const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  user: 'shin_chan',      // Replace with your PostgreSQL username
  host: 'localhost',     // PostgreSQL host
  database: 'musicdb',   // Your database name
  password: '2006',  // Replace with your password
  port: 5432,            // Default PostgreSQL port
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// Helper function for database queries
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool
};