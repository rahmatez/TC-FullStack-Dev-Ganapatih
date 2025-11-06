const express = require('express');
const { body } = require('express-validator');
const Post = require('../models/Post');
const authenticateToken = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Create a post
router.post(
  '/',
  authenticateToken,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const content = (req.body.content || '').trim();
      if (content.length > 200) {
        return res.status(422).json({
          error: 'Unprocessable Entity',
          message: 'Content must not exceed 200 characters'
        });
      }

      const userId = req.user.id;

      const post = await Post.create(userId, content);

      res.status(201).json({
        id: post.id,
        userid: post.user_id,
        content: post.content,
        createdat: post.created_at
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get a specific post
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.getById(id);

    if (!post) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found'
      });
    }

    res.json({
      id: post.id,
      userId: post.user_id,
      username: post.username,
      content: post.content,
      createdAt: post.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Get user's own posts
router.get('/user/me', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.getUserPosts(req.user.id, page, limit);

    res.json({
      page,
      posts: posts.map(post => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        content: post.content,
        createdAt: post.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
