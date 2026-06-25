const express = require('express');
const Post = require('../models/Post');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get news feed
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page

    const feedData = await Post.getFeedForUser(req.user.id, page, limit);

    res.json({
      page: feedData.page,
      posts: feedData.posts.map(post => ({
        id: post.id,
        userid: post.user_id,
        username: post.username,
        content: post.content,
        createdat: post.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
