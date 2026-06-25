const pool = require('../database/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async checkUsernameExists(username) {
    const result = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    return result.rows.length > 0;
  }

  static async listUsersWithFollowStatus(currentUserId) {
    const result = await pool.query(
      `SELECT u.id, u.username, u.created_at, 
              EXISTS (
                SELECT 1 FROM follows f 
                WHERE f.follower_id = $1 AND f.followee_id = u.id
              ) AS is_following
       FROM users u
       WHERE u.id <> $1
       ORDER BY u.username ASC`,
      [currentUserId]
    );

    return result.rows;
  }
}

module.exports = User;
