const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const authController = {
  signup: async (req, res) => {
    try {
      const { username, email, password, gender, date_of_birth, location } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await userModel.checkUserExists(username, email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // Create new user
      const newUser = await userModel.createUser({
        username,
        email,
        password,
        gender,
        date_of_birth,
        location
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user_id: newUser.user_id,
          username: newUser.username
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user'
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await userModel.findUserByEmail(email);
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

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user_id: user.user_id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login'
      });
    }
  }
};

module.exports = authController;