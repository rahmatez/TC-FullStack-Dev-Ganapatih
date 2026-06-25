const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'development_access_secret';
const ACCESS_TOKEN_EXPIRE = process.env.JWT_EXPIRE || '15m';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'development_refresh_secret';
const REFRESH_TOKEN_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// Register endpoint
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Check if username already exists
      const exists = await User.checkUsernameExists(username);
      if (exists) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Username already exists'
        });
      }

      // Create user
      const user = await User.create(username, password);

      res.status(201).json({
        id: user.id,
        username: user.username,
        createdAt: user.created_at
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login endpoint
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid username or password'
        });
      }

      // Verify password
      const isValid = await User.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid username or password'
        });
      }

      // Generate access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRE }
      );

      // Generate refresh token (bonus feature)
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRE }
      );

      res.json({
        token: accessToken,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token endpoint (bonus feature)
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token is required'
      });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token'
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRE }
      );

      res.json({ token: accessToken });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
