require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { createTables } = require('./migrate');

const demoUsers = [
  {
    username: 'demo',
    password: 'password123',
    posts: [
      'Welcome to NewsFeed! Follow me to see more updates.',
      'Remember: posts are limited to 200 characters. Keep it short and sweet!'
    ]
  },
  {
    username: 'alice',
    password: 'password123',
    posts: ['Exploring the new NewsFeed platform. Loving the clean UI!']
  },
  {
    username: 'bob',
    password: 'password123',
    posts: ['Just joined NewsFeed. Say hi and drop a follow!']
  }
];

const followPairs = [
  ['demo', 'alice'],
  ['demo', 'bob'],
  ['alice', 'demo'],
  ['bob', 'demo']
];

async function seed() {
  await createTables();

  const client = await pool.connect();
  const createdUsers = new Map();

  try {
    await client.query('BEGIN');

    for (const user of demoUsers) {
      const existing = await client.query('SELECT id FROM users WHERE username = $1', [user.username]);
      if (existing.rows.length > 0) {
        createdUsers.set(user.username, existing.rows[0].id);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      const inserted = await client.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
        [user.username, hashedPassword]
      );

      const userId = inserted.rows[0].id;
      createdUsers.set(user.username, userId);

      for (const content of user.posts) {
        await client.query(
          `INSERT INTO posts (user_id, content)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, content]
        );
      }
    }

    for (const [followerUsername, followeeUsername] of followPairs) {
      const followerId = createdUsers.get(followerUsername);
      const followeeId = createdUsers.get(followeeUsername);

      if (!followerId || !followeeId) {
        continue;
      }

      await client.query(
        `INSERT INTO follows (follower_id, followee_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [followerId, followeeId]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed data inserted successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed database:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { seed };
