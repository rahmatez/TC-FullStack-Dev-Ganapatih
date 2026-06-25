const Post = require('../../src/models/Post');
const User = require('../../src/models/User');
const pool = require('../../src/database/db');

describe('Post Model - Unit Tests', () => {
  let testUserId;
  let testPostId;
  const testUsername = 'posttest_user_' + Date.now();

  beforeAll(async () => {
    // Create test user
    const user = await User.create(testUsername, 'password123');
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('create()', () => {
    it('should create a new post', async () => {
      const post = await Post.create(testUserId, 'This is a test post');

      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('user_id', testUserId);
      expect(post).toHaveProperty('content', 'This is a test post');
      expect(post).toHaveProperty('created_at');

      testPostId = post.id;
    });

    it('should store post with correct timestamp', async () => {
      const post = await Post.create(testUserId, 'Another test post');
      const now = new Date();
      const postDate = new Date(post.created_at);

      // Check if post was created within last 5 seconds
      const diff = Math.abs(now - postDate);
      expect(diff).toBeLessThan(5000);
    });
  });

  describe('getById()', () => {
    it('should get post by ID with username', async () => {
      const post = await Post.getById(testPostId);

      expect(post).toHaveProperty('id', testPostId);
      expect(post).toHaveProperty('user_id', testUserId);
      expect(post).toHaveProperty('content', 'This is a test post');
      expect(post).toHaveProperty('username', testUsername);
    });

    it('should return undefined for non-existent post', async () => {
      const post = await Post.getById(999999);

      expect(post).toBeUndefined();
    });
  });

  describe('getUserPosts()', () => {
    beforeAll(async () => {
      // Create multiple posts
      await Post.create(testUserId, 'Post 1');
      await Post.create(testUserId, 'Post 2');
      await Post.create(testUserId, 'Post 3');
    });

    it('should get all posts by user', async () => {
      const posts = await Post.getUserPosts(testUserId);

      expect(posts).toBeInstanceOf(Array);
      expect(posts.length).toBeGreaterThanOrEqual(4); // At least 4 posts
      expect(posts[0]).toHaveProperty('username', testUsername);
    });

    it('should return posts ordered by newest first', async () => {
      const posts = await Post.getUserPosts(testUserId);

      if (posts.length > 1) {
        const firstDate = new Date(posts[0].created_at);
        const secondDate = new Date(posts[1].created_at);
        expect(firstDate >= secondDate).toBe(true);
      }
    });

    it('should support pagination', async () => {
      const page1 = await Post.getUserPosts(testUserId, 1, 2);
      const page2 = await Post.getUserPosts(testUserId, 2, 2);

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeGreaterThanOrEqual(0);

      // Posts should be different
      if (page1.length > 0 && page2.length > 0) {
        expect(page1[0].id).not.toBe(page2[0].id);
      }
    });

    it('should return empty array for user with no posts', async () => {
      const posts = await Post.getUserPosts(999999);

      expect(posts).toBeInstanceOf(Array);
      expect(posts.length).toBe(0);
    });
  });

  describe('getFeedForUser()', () => {
    it('should return feed data with pagination info', async () => {
      const feedData = await Post.getFeedForUser(testUserId, 1, 10);

      expect(feedData).toHaveProperty('posts');
      expect(feedData).toHaveProperty('total');
      expect(feedData).toHaveProperty('page', 1);
      expect(feedData).toHaveProperty('totalPages');
      expect(feedData.posts).toBeInstanceOf(Array);
    });

    it('should return empty feed for user not following anyone', async () => {
      const feedData = await Post.getFeedForUser(testUserId);

      expect(feedData.posts.length).toBe(0);
      expect(feedData.total).toBe(0);
    });
  });
});
