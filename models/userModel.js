const db = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  // Create new user
  createUser: async (userData) => {
    const { username, email, password, gender, date_of_birth, location } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users 
       (username, email, password_hash, gender, date_of_birth, location) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING user_id, username, email`,
      [username, email, passwordHash, gender || null, date_of_birth || null, location || null]
    );
    return result.rows[0];
  },

  // Find user by email
  findUserByEmail: async (email) => {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Check if user exists
  checkUserExists: async (username, email) => {
    const result = await db.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    return result.rows[0];
  }
};

module.exports = userModel;