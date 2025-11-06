const request = require('supertest');
const app = require('../../src/server');
const pool = require('../../src/database/db');

describe('Social Features - Integration Tests', () => {
  let user1Token, user2Token, user3Token;
  let user1Id, user2Id, user3Id;
  const timestamp = Date.now();

  beforeAll(async () => {
    // Create three test users
    const user1 = await request(app)
      .post('/api/register')
      .send({ username: `social_user1_${timestamp}`, password: 'password123' });
    
    const user2 = await request(app)
      .post('/api/register')
      .send({ username: `social_user2_${timestamp}`, password: 'password123' });
    
    const user3 = await request(app)
      .post('/api/register')
      .send({ username: `social_user3_${timestamp}`, password: 'password123' });

    user1Id = user1.body.id;
    user2Id = user2.body.id;
    user3Id = user3.body.id;

    // Login all users
    const login1 = await request(app)
      .post('/api/login')
      .send({ username: `social_user1_${timestamp}`, password: 'password123' });
    
    const login2 = await request(app)
      .post('/api/login')
      .send({ username: `social_user2_${timestamp}`, password: 'password123' });
    
    const login3 = await request(app)
      .post('/api/login')
      .send({ username: `social_user3_${timestamp}`, password: 'password123' });

    user1Token = login1.body.token;
    user2Token = login2.body.token;
    user3Token = login3.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [user1Id, user2Id, user3Id]);
    await pool.end();
  });

  describe('Complete Follow/Unfollow Flow', () => {
    it('should allow user1 to follow user2', async () => {
      const res = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.message).toContain('following');
    });

    it('should allow user1 to follow user3', async () => {
      const res = await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.message).toContain('following');
    });

    it('should allow user2 to follow user3', async () => {
      const res = await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(res.body.message).toContain('following');
    });

    it('should prevent duplicate follows', async () => {
      const res = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(409);

      expect(res.body.error).toBe('Conflict');
    });

    it('should prevent self-follow', async () => {
      const res = await request(app)
        .post(`/api/follow/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
    });

    it('should get user2 followers list', async () => {
      const res = await request(app)
        .get(`/api/users/${user2Id}/followers`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.some(u => u.id === user1Id)).toBe(true);
    });

    it('should get user1 following list', async () => {
      const res = await request(app)
        .get(`/api/users/${user1Id}/following`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
    });

    it('should unfollow successfully', async () => {
      const res = await request(app)
        .delete(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.message).toContain('unfollowed');
    });

    it('should verify unfollow worked', async () => {
      const res = await request(app)
        .get(`/api/users/${user1Id}/following`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body.some(u => u.id === user3Id)).toBe(false);
    });

    it('should prevent unfollowing non-followed user', async () => {
      const res = await request(app)
        .delete(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(res.body.error).toBe('Not Found');
    });
  });

  describe('Complete Post & Feed Flow', () => {
    let post1Id, post2Id, post3Id;

    it('should allow user2 to create post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Hello from user 2!' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('Hello from user 2!');
      post1Id = res.body.id;
    });

    it('should allow user3 to create multiple posts', async () => {
      const res1 = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({ content: 'First post from user 3' })
        .expect(201);

      const res2 = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user3Token}`)
        .send({ content: 'Second post from user 3' })
        .expect(201);

      post2Id = res1.body.id;
      post3Id = res2.body.id;
    });

    it('should show posts from followed users in feed', async () => {
      // user1 follows user2, so should see user2's posts
      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts).toBeInstanceOf(Array);
      expect(res.body.posts.length).toBeGreaterThan(0);
      
      // Should contain posts from user2
      const hasUser2Posts = res.body.posts.some(p => p.userid === user2Id);
      expect(hasUser2Posts).toBe(true);
    });

    it('should not show posts from unfollowed users', async () => {
      // user1 doesn't follow user3 anymore
      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Should NOT contain posts from user3
      const hasUser3Posts = res.body.posts.some(p => p.userid === user3Id);
      expect(hasUser3Posts).toBe(false);
    });

    it('should order feed by newest first', async () => {
      const res = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      if (res.body.posts.length > 1) {
        const firstDate = new Date(res.body.posts[0].createdat);
        const secondDate = new Date(res.body.posts[1].createdat);
        expect(firstDate >= secondDate).toBe(true);
      }
    });

    it('should support feed pagination', async () => {
      const res = await request(app)
        .get('/api/feed?page=1&limit=1')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.page).toBe(1);
      expect(res.body.posts.length).toBeLessThanOrEqual(1);
    });

    it('should get user posts', async () => {
      const res = await request(app)
        .get(`/api/users/${user3Id}/posts`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should validate post content length', async () => {
      const longContent = 'a'.repeat(201);
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: longContent })
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toBe('Content must not exceed 200 characters');
    });

    it('should reject empty post content', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ content: '' })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
    });
  });

  describe('Complete User Journey', () => {
    it('scenario: new user registers, follows others, creates post, sees feed', async () => {
      // 1. Register new user
      const register = await request(app)
        .post('/api/register')
        .send({ username: `journey_user_${Date.now()}`, password: 'password123' })
        .expect(201);

      const newUserId = register.body.id;

      // 2. Login
      const login = await request(app)
        .post('/api/login')
        .send({ username: register.body.username, password: 'password123' })
        .expect(200);

      const token = login.body.token;

      // 3. Follow user2 and user3
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app)
        .post(`/api/follow/${user3Id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // 4. Create own post
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'My first post!' })
        .expect(201);

      // 5. View feed (should see posts from user2 and user3)
      const feed = await request(app)
        .get('/api/feed')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(feed.body.posts.length).toBeGreaterThan(0);

      // 6. View own profile
      const profile = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profile.body.username).toBe(register.body.username);

      // 7. Get own posts
      const posts = await request(app)
        .get(`/api/users/${newUserId}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(posts.body.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [newUserId]);
    });
  });
});
