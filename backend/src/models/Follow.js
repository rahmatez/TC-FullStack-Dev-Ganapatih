const pool = require('../database/db');

class Follow {
  static async follow(followerId, followeeId) {
    // Check if already following
    const existingFollow = await pool.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND followee_id = $2',
      [followerId, followeeId]
    );

    if (existingFollow.rows.length > 0) {
      return { alreadyFollowing: true };
    }

    const result = await pool.query(
      'INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) RETURNING *',
      [followerId, followeeId]
    );
    return result.rows[0];
  }

  static async unfollow(followerId, followeeId) {
    const result = await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2 RETURNING *',
      [followerId, followeeId]
    );
    return result.rows[0];
  }

  static async isFollowing(followerId, followeeId) {
    const result = await pool.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND followee_id = $2',
      [followerId, followeeId]
    );
    return result.rows.length > 0;
  }

  static async getFollowers(userId) {
    const result = await pool.query(
      `SELECT u.id, u.username, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followee_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getFollowing(userId) {
    const result = await pool.query(
      `SELECT u.id, u.username, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.followee_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getFollowersCount(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM follows WHERE followee_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async getFollowingCount(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Follow;
