const User = require('../../src/models/User');
const pool = require('../../src/database/db');

describe('User Model - Unit Tests', () => {
  const testUsername = 'unittest_user_' + Date.now();
  let createdUserId;

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE username = $1', [testUsername]);
    await pool.end();
  });

  describe('create()', () => {
    it('should create a new user with hashed password', async () => {
      const user = await User.create(testUsername, 'password123');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username', testUsername);
      expect(user).toHaveProperty('created_at');
      expect(user).not.toHaveProperty('password_hash');

      createdUserId = user.id;
    });

    it('should hash password (not store plain text)', async () => {
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [createdUserId]
      );

      expect(result.rows[0].password_hash).toBeDefined();
      expect(result.rows[0].password_hash).not.toBe('password123');
      expect(result.rows[0].password_hash.length).toBeGreaterThan(20);
    });
  });

  describe('findByUsername()', () => {
    it('should find user by username', async () => {
      const user = await User.findByUsername(testUsername);

      expect(user).toHaveProperty('id', createdUserId);
      expect(user).toHaveProperty('username', testUsername);
      expect(user).toHaveProperty('password_hash');
    });

    it('should return undefined for non-existent username', async () => {
      const user = await User.findByUsername('nonexistent_user_12345');

      expect(user).toBeUndefined();
    });
  });

  describe('findById()', () => {
    it('should find user by ID', async () => {
      const user = await User.findById(createdUserId);

      expect(user).toHaveProperty('id', createdUserId);
      expect(user).toHaveProperty('username', testUsername);
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should return undefined for non-existent ID', async () => {
      const user = await User.findById(999999);

      expect(user).toBeUndefined();
    });
  });

  describe('verifyPassword()', () => {
    it('should return true for correct password', async () => {
      const user = await User.findByUsername(testUsername);
      const isValid = await User.verifyPassword('password123', user.password_hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.findByUsername(testUsername);
      const isValid = await User.verifyPassword('wrongpassword', user.password_hash);

      expect(isValid).toBe(false);
    });
  });

  describe('checkUsernameExists()', () => {
    it('should return true for existing username', async () => {
      const exists = await User.checkUsernameExists(testUsername);

      expect(exists).toBe(true);
    });

    it('should return false for non-existing username', async () => {
      const exists = await User.checkUsernameExists('nonexistent_user_12345');

      expect(exists).toBe(false);
    });
  });
});
