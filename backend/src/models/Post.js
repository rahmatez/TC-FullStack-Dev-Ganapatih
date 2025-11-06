const pool = require('../database/db');

class Post {
  static async create(userId, content) {
    const result = await pool.query(
      'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id, user_id, content, created_at',
      [userId, content]
    );
    return result.rows[0];
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getFeedForUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.created_at, u.username
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id IN (
         SELECT followee_id FROM follows WHERE follower_id = $1
       )
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM posts
       WHERE user_id IN (
         SELECT followee_id FROM follows WHERE follower_id = $1
       )`,
      [userId]
    );

    return {
      posts: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
  }

  static async getUserPosts(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT p.*, u.username FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }
}

module.exports = Post;
