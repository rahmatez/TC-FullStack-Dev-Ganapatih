const express = require('express');
const Follow = require('../models/Follow');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Follow a user
router.post('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const followeeId = parseInt(req.params.userId);
    const followerId = req.user.id;

    // Validate user ID
    if (isNaN(followeeId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid user ID format'
      });
    }

    // Check if trying to follow self
    if (followerId === followeeId) {
      return res.status(422).json({
        error: 'Unprocessable Entity',
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userExists = await User.findById(followeeId);
    if (!userExists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Follow the user
    const result = await Follow.follow(followerId, followeeId);

    if (result.alreadyFollowing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already following this user'
      });
    }

    res.json({
      message: `You are now following user ${followeeId}`
    });
  } catch (error) {
    next(error);
  }
});

// Unfollow a user
router.delete('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const followeeId = parseInt(req.params.userId);
    const followerId = req.user.id;

    // Check if user exists
    const userExists = await User.findById(followeeId);
    if (!userExists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Unfollow the user
    const result = await Follow.unfollow(followerId, followeeId);

    if (!result) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'You are not following this user'
      });
    }

    res.json({
      message: `You unfollowed user ${followeeId}`
    });
  } catch (error) {
    next(error);
  }
});

// Check if following a user
router.get('/check/:userId', authenticateToken, async (req, res, next) => {
  try {
    const followeeId = parseInt(req.params.userId);
    const followerId = req.user.id;

    const isFollowing = await Follow.isFollowing(followerId, followeeId);

    res.json({ isFollowing });
  } catch (error) {
    next(error);
  }
});

// Get followers
router.get('/followers/:userId', authenticateToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const followers = await Follow.getFollowers(userId);

    res.json({
      count: followers.length,
      followers
    });
  } catch (error) {
    next(error);
  }
});

// Get following
router.get('/following/:userId', authenticateToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const following = await Follow.getFollowing(userId);

    res.json({
      count: following.length,
      following
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
