const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production

const authController = {
  signup: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if user already exists
      const existingUser = await userModel.checkExists(username, email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // Create new user
      const newUser = await userModel.createUser({ username, email, password });

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.user_id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            userId: newUser.user_id,
            username: newUser.username,
            email: newUser.email
          },
          token
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier can be username or email

      // Validate input
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Identifier and password are required'
        });
      }

      // Find user
      const user = await userModel.findUser(identifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            userId: user.user_id,
            username: user.username,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }
};

module.exports = authController;