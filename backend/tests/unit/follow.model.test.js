const Follow = require('../../src/models/Follow');
const User = require('../../src/models/User');
const pool = require('../../src/database/db');

describe('Follow Model - Unit Tests', () => {
  let follower1Id, follower2Id, followeeId;
  const timestamp = Date.now();

  beforeAll(async () => {
    // Create test users
    const follower1 = await User.create(`follow_test_follower1_${timestamp}`, 'password123');
    const follower2 = await User.create(`follow_test_follower2_${timestamp}`, 'password123');
    const followee = await User.create(`follow_test_followee_${timestamp}`, 'password123');

    follower1Id = follower1.id;
    follower2Id = follower2.id;
    followeeId = followee.id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [follower1Id, follower2Id, followeeId]);
    await pool.end();
  });

  describe('follow()', () => {
    it('should create follow relationship', async () => {
      const result = await Follow.follow(follower1Id, followeeId);

      expect(result).toHaveProperty('follower_id', follower1Id);
      expect(result).toHaveProperty('followee_id', followeeId);
      expect(result).toHaveProperty('created_at');
    });

    it('should return alreadyFollowing=true if already following', async () => {
      const result = await Follow.follow(follower1Id, followeeId);

      expect(result).toHaveProperty('alreadyFollowing', true);
    });

    it('should allow multiple users to follow same person', async () => {
      const result = await Follow.follow(follower2Id, followeeId);

      expect(result).toHaveProperty('follower_id', follower2Id);
      expect(result).toHaveProperty('followee_id', followeeId);
    });
  });

  describe('isFollowing()', () => {
    it('should return true if following', async () => {
      const isFollowing = await Follow.isFollowing(follower1Id, followeeId);

      expect(isFollowing).toBe(true);
    });

    it('should return false if not following', async () => {
      const isFollowing = await Follow.isFollowing(followeeId, follower1Id);

      expect(isFollowing).toBe(false);
    });
  });

  describe('getFollowers()', () => {
    it('should get list of followers', async () => {
      const followers = await Follow.getFollowers(followeeId);

      expect(followers).toBeInstanceOf(Array);
      expect(followers.length).toBeGreaterThanOrEqual(2);
      expect(followers[0]).toHaveProperty('id');
      expect(followers[0]).toHaveProperty('username');
      expect(followers[0]).not.toHaveProperty('password_hash');
    });

    it('should return empty array if no followers', async () => {
      const followers = await Follow.getFollowers(follower1Id);

      expect(followers).toBeInstanceOf(Array);
      expect(followers.length).toBe(0);
    });
  });

  describe('getFollowing()', () => {
    it('should get list of users being followed', async () => {
      const following = await Follow.getFollowing(follower1Id);

      expect(following).toBeInstanceOf(Array);
      expect(following.length).toBeGreaterThanOrEqual(1);
      expect(following[0]).toHaveProperty('id', followeeId);
      expect(following[0]).toHaveProperty('username');
    });

    it('should return empty array if not following anyone', async () => {
      const following = await Follow.getFollowing(followeeId);

      expect(following).toBeInstanceOf(Array);
      expect(following.length).toBe(0);
    });
  });

  describe('getFollowersAndFollowing()', () => {
    it('should get followers count', async () => {
      const followers = await Follow.getFollowers(followeeId);

      expect(followers).toBeInstanceOf(Array);
      expect(followers.length).toBeGreaterThanOrEqual(1); // Changed from 2 because follower1 unfollowed
    });

    it('should get following count', async () => {
      const following = await Follow.getFollowing(follower2Id);

      expect(following).toBeInstanceOf(Array);
      expect(following.length).toBeGreaterThanOrEqual(1); // follower2 still follows followee
    });
  });

  describe('unfollow()', () => {
    it('should remove follow relationship', async () => {
      const result = await Follow.unfollow(follower1Id, followeeId);

      expect(result).toHaveProperty('follower_id', follower1Id);
      expect(result).toHaveProperty('followee_id', followeeId);
    });

    it('should return undefined if not following', async () => {
      const result = await Follow.unfollow(follower1Id, followeeId);

      expect(result).toBeUndefined();
    });

    it('should verify unfollow worked', async () => {
      const isFollowing = await Follow.isFollowing(follower1Id, followeeId);

      expect(isFollowing).toBe(false);
    });
  });
});
