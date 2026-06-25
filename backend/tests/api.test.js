const request = require('supertest');
const app = require('../src/server');
const pool = require('../src/database/db');

describe('Authentication API', () => {
  let authToken;
  const testUser = {
    username: 'testuser_' + Date.now(),
    password: 'testpassword123'
  };

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE username = $1', [testUser.username]);
    await pool.end();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', testUser.username);
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 409 for duplicate username', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(409);

      expect(res.body).toHaveProperty('error', 'Conflict');
      expect(res.body).toHaveProperty('message', 'Username already exists');
    });

    it('should return 400 for invalid username', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'ab', password: 'password123' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Bad Request');
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'validuser', password: '12345' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', testUser.username);

      authToken = res.body.token;
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: testUser.username, password: 'wrongpassword' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a post successfully', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test post content' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('content', 'Test post content');
      expect(res.body).toHaveProperty('userid');
      expect(res.body).toHaveProperty('createdat');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ content: 'Test post' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 422 for content > 200 characters', async () => {
      const longContent = 'a'.repeat(201);
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: longContent })
        .expect(422);

      expect(res.body).toHaveProperty('error', 'Unprocessable Entity');
      expect(res.body).toHaveProperty('message', 'Content must not exceed 200 characters');
    });

    it('should return 400 for empty content', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: '' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('GET /api/feed', () => {
    it('should return empty feed for user not following anyone', async () => {
      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts).toBeInstanceOf(Array);
      expect(res.body.posts).toHaveLength(0);
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/feed')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('message');
    });
  });

  // Test Follow/Unfollow System
  describe('Follow System', () => {
    let user2Token;
    let user2Id;
    const testUser2 = {
      username: 'testuser2_' + Date.now(),
      password: 'testpassword123'
    };

    beforeAll(async () => {
      // Create second test user
      const registerRes = await request(app)
        .post('/api/register')
        .send(testUser2);
      
      user2Id = registerRes.body.id;

      // Login as second user
      const loginRes = await request(app)
        .post('/api/login')
        .send(testUser2);
      
      user2Token = loginRes.body.token;
    });

    afterAll(async () => {
      // Clean up second test user
      await pool.query('DELETE FROM users WHERE username = $1', [testUser2.username]);
    });

    describe('POST /api/follow/:userId', () => {
      it('should follow a valid user successfully', async () => {
        const res = await request(app)
          .post(`/api/follow/${user2Id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('following');
      });

      it('should return 409 if already following', async () => {
        const res = await request(app)
          .post(`/api/follow/${user2Id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(409);

        expect(res.body).toHaveProperty('error', 'Conflict');
        expect(res.body.message).toContain('already following');
      });

      it('should return 422 when trying to follow self', async () => {
        // Get current user ID from token
        const meRes = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`);

        const res = await request(app)
          .post(`/api/follow/${meRes.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(422);

        expect(res.body).toHaveProperty('error', 'Unprocessable Entity');
        expect(res.body.message).toContain('cannot follow yourself');
      });

      it('should return 404 for non-existent user', async () => {
        const res = await request(app)
          .post('/api/follow/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(res.body).toHaveProperty('error', 'Not Found');
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .post(`/api/follow/${user2Id}`)
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('DELETE /api/follow/:userId', () => {
      it('should unfollow a user successfully', async () => {
        const res = await request(app)
          .delete(`/api/follow/${user2Id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('unfollowed');
      });

      it('should return 404 if not following', async () => {
        const res = await request(app)
          .delete(`/api/follow/${user2Id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(res.body).toHaveProperty('error', 'Not Found');
        expect(res.body.message).toContain('not following');
      });

      it('should return 404 for non-existent user', async () => {
        const res = await request(app)
          .delete('/api/follow/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(res.body).toHaveProperty('error', 'Not Found');
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .delete(`/api/follow/${user2Id}`)
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('GET /api/users/:id/followers', () => {
      beforeAll(async () => {
        // Follow user2 again for followers test
        await request(app)
          .post(`/api/follow/${user2Id}`)
          .set('Authorization', `Bearer ${authToken}`);
      });

      it('should get followers list', async () => {
        const res = await request(app)
          .get(`/api/users/${user2Id}/followers`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('username');
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .get(`/api/users/${user2Id}/followers`)
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('GET /api/users/:id/following', () => {
      it('should get following list', async () => {
        const meRes = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`);

        const res = await request(app)
          .get(`/api/users/${meRes.body.id}/following`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .get('/api/users/1/following')
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });
  });

  // Test User Endpoints
  describe('User Endpoints', () => {
    describe('GET /api/users', () => {
      const listUser = {
        username: 'listuser_' + Date.now(),
        password: 'testpassword123'
      };
      let listUserId;

      beforeAll(async () => {
        const res = await request(app)
          .post('/api/register')
          .send(listUser);
        listUserId = res.body.id;
      });

      afterAll(async () => {
        await pool.query('DELETE FROM users WHERE username = $1', [listUser.username]);
      });

      it('should list other users with follow status', async () => {
        const res = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        const targetUser = res.body.find(user => user.id === listUserId);
        expect(targetUser).toBeDefined();
        expect(targetUser).toHaveProperty('isFollowing', false);
      });

      it('should reflect follow status changes', async () => {
        await request(app)
          .post(`/api/follow/${listUserId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const res = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const targetUser = res.body.find(user => user.id === listUserId);
        expect(targetUser).toBeDefined();
        expect(targetUser).toHaveProperty('isFollowing', true);

        await request(app)
          .delete(`/api/follow/${listUserId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });

      it('should return 401 without auth token', async () => {
        await request(app)
          .get('/api/users')
          .expect(401);
      });
    });

    describe('GET /api/users/me', () => {
      it('should get current user profile', async () => {
        const res = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username', testUser.username);
        expect(res.body).not.toHaveProperty('password_hash');
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .get('/api/users/me')
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get user by ID', async () => {
        const meRes = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`);

        const res = await request(app)
          .get(`/api/users/${meRes.body.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toHaveProperty('id', meRes.body.id);
        expect(res.body).toHaveProperty('username');
      });

      it('should return 404 for non-existent user', async () => {
        const res = await request(app)
          .get('/api/users/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(res.body).toHaveProperty('error', 'Not Found');
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .get('/api/users/1')
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });

    describe('GET /api/users/:id/posts', () => {
      let postId;

      beforeAll(async () => {
        // Create a test post first
        const postRes = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'Test post for user posts endpoint' });
        
        postId = postRes.body.id;
      });

      it('should get posts by user ID', async () => {
        const meRes = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`);

        const res = await request(app)
          .get(`/api/users/${meRes.body.id}/posts`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('content');
      });

      it('should return empty array for user with no posts', async () => {
        const res = await request(app)
          .get('/api/users/99999/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(0);
      });

      it('should support pagination', async () => {
        const res = await request(app)
          .get('/api/users/1/posts?page=1&limit=5')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(res.body).toBeInstanceOf(Array);
      });

      it('should return 401 without auth token', async () => {
        const res = await request(app)
          .get('/api/users/1/posts')
          .expect(401);

        expect(res.body).toHaveProperty('error', 'Unauthorized');
      });
    });
  });

  // Test Feed with Follow Relationship
  describe('Feed with Follow Relationship', () => {
    let user3Token;
    let user3Id;
    const testUser3 = {
      username: 'testuser3_' + Date.now(),
      password: 'testpassword123'
    };

    beforeAll(async () => {
      // Create third test user
      const registerRes = await request(app)
        .post('/api/register')
        .send(testUser3);
      
      user3Id = registerRes.body.id;

      // Login as third user
      const loginRes = await request(app)
        .post('/api/login')
        .send(testUser3);
      
      user3Token = loginRes.body.token;

      // User3 creates some posts
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({ content: 'Post from user 3 - first' });

      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({ content: 'Post from user 3 - second' });
    });

    afterAll(async () => {
      await pool.query('DELETE FROM users WHERE username = $1', [testUser3.username]);
    });

    it('should show posts from followed users in feed', async () => {
      // Follow user3
      await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Get feed
      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts).toBeInstanceOf(Array);
      expect(res.body.posts.length).toBeGreaterThan(0);
      
      // Check if posts are from followed user
      const hasUser3Posts = res.body.posts.some(post => post.userid === user3Id);
      expect(hasUser3Posts).toBe(true);
    });

    it('should not show posts from unfollowed users', async () => {
      // Unfollow user3
      await request(app)
        .delete(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Get feed
      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('posts');
      
      // Check if posts from user3 are not in feed
      const hasUser3Posts = res.body.posts.some(post => post.userid === user3Id);
      expect(hasUser3Posts).toBe(false);
    });

    it('should order feed posts by newest first', async () => {
      // Follow user3 again
      await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${authToken}`);

      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (res.body.posts.length > 1) {
        const firstPostDate = new Date(res.body.posts[0].createdat);
        const secondPostDate = new Date(res.body.posts[1].createdat);
        expect(firstPostDate >= secondPostDate).toBe(true);
      }
    });

    it('should support pagination in feed', async () => {
      const res = await request(app)
        .get('/api/feed?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts.length).toBeLessThanOrEqual(1);
    });
  });

  // Test JWT Refresh Token
  describe('JWT Refresh Token', () => {
    let refreshToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/login')
        .send(testUser);
      
      refreshToken = res.body.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.token).toBeTruthy();
    });

    it('should return 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .send({ refreshToken: 'invalid_token_here' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 for missing refresh token', async () => {
      const res = await request(app)
        .post('/api/refresh')
        .send({})
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  // Test Error Handling
  describe('Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Not Found');
    });

    it('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/api/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should return 401 for invalid JWT token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 for missing Authorization header', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ content: 'Test' })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .post('/api/follow/invalid_id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
