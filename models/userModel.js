const db = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  // Create new user
  createUser: async (userData) => {
    const { username, email, password } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  // Find user by username or email
  findUser: async (identifier) => {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [identifier]
    );
    return result.rows[0];
  },

  // Verify if username or email already exists
  checkExists: async (username, email) => {
    const result = await db.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    return result.rows[0];
  }
};

module.exports = userModel;