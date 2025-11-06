const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get users with follow status
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const users = await User.listUsersWithFollowStatus(req.user.id);

    res.json(users.map(user => ({
      id: user.id,
      username: user.username,
      createdAt: user.created_at,
      isFollowing: user.is_following
    })));
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user's posts
router.get('/:id/posts', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const posts = await Post.getUserPosts(id, page, limit);
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get user's followers
router.get('/:id/followers', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const followers = await Follow.getFollowers(id);
    res.json(followers);
  } catch (error) {
    next(error);
  }
});

// Get user's following
router.get('/:id/following', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const following = await Follow.getFollowing(id);
    res.json(following);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
