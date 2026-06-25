const request = require('supertest');
const app = require('../../src/server');
const pool = require('../../src/database/db');

describe('Authentication Flow - Integration Tests', () => {
  const testUsername = 'integration_auth_' + Date.now();
  const testPassword = 'testPassword123';
  let accessToken;
  let refreshToken;

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE username = $1', [testUsername]);
    await pool.end();
  });

  describe('Complete Registration Flow', () => {
    it('should register new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: testUsername, password: testPassword })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', testUsername);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('should prevent duplicate registration', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: testUsername, password: testPassword })
        .expect(409);

      expect(res.body.error).toBe('Conflict');
      expect(res.body.message).toContain('already exists');
    });

    it('should validate username length (min 3)', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'ab', password: testPassword })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
    });

    it('should validate username format (alphanumeric + underscore)', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'user@invalid!', password: testPassword })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
    });

    it('should validate password length (min 6)', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'validuser123', password: '12345' })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
    });
  });

  describe('Complete Login Flow', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: testUsername, password: testPassword })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('username', testUsername);

      accessToken = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should reject incorrect password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: testUsername, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'nonexistent_user_123', password: testPassword })
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });

    it('should require username field', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ password: testPassword })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
    });

    it('should require password field', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: testUsername })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);

      // Update access token for next tests
      accessToken = res.body.token;
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .send({ refreshToken: 'invalid_token_string' })
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .send({})
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Protected Route Access', () => {
    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('username', testUsername);
    });

    it('should reject access without token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });

    it('should reject access with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });

    it('should reject access with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(res.body.error).toBe('Unauthorized');
    });
  });
});
