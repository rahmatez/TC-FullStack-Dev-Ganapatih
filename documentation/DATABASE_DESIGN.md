# 📋 Database Design

Comprehensive database schema and design documentation for the News Feed System.

---

## 🗄️ Database Overview

- **Database System:** PostgreSQL 15
- **Total Tables:** 3 (users, posts, follows)
- **Total Indexes:** 6
- **Relationships:** 3 foreign keys
- **Constraints:** 2 check constraints

---

## 📊 Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ • id (PK)       │◄─────┐
│ • username      │      │
│ • password_hash │      │
│ • created_at    │      │
└─────────────────┘      │
         ▲               │
         │               │
         │ user_id (FK)  │
         │               │
┌─────────────────┐      │
│     POSTS       │      │
│─────────────────│      │
│ • id (PK)       │      │
│ • user_id (FK)  ├──────┘
│ • content       │
│ • created_at    │
└─────────────────┘

┌──────────────────────────────┐
│          FOLLOWS             │
│──────────────────────────────│
│ • follower_id (PK, FK)       ├──────┐
│ • followee_id (PK, FK)       ├──┐   │
│ • created_at                 │  │   │
└──────────────────────────────┘  │   │
         │                        │   │
         └────────────────────────┼───┘
                                  │
                          References USERS
```

---

## 📝 Table Schemas

### 1. Users Table

**Purpose:** Store user account information and authentication credentials

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing user ID |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Unique username (3-50 chars) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT NOW | Account creation timestamp |

**Indexes:**
- Primary key index on `id` (automatic)
- Unique index on `username` (automatic from UNIQUE constraint)

**Sample Data:**
```sql
id | username | password_hash                                    | created_at
---+----------+-------------------------------------------------+-------------------------
1  | demo     | $2b$10$xKq1gF3vHxVq9FvH9XvKHeDSs...              | 2025-11-01 10:00:00
2  | alice    | $2b$10$yKq2gF4vHxVq9FvH9XvKHeDSs...              | 2025-11-02 11:30:00
3  | bob      | $2b$10$zKq3gF5vHxVq9FvH9XvKHeDSs...              | 2025-11-03 14:15:00
```

---

### 2. Posts Table

**Purpose:** Store user-generated posts (max 200 characters)

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing post ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY | References users.id |
| `content` | VARCHAR(200) | NOT NULL | Post content (max 200 chars) |
| `created_at` | TIMESTAMP | DEFAULT NOW | Post creation timestamp |

**Foreign Keys:**
- `user_id` → `users(id)` with `ON DELETE CASCADE`
  - When a user is deleted, all their posts are automatically deleted

**Indexes:**
1. Primary key index on `id` (automatic)
2. `idx_posts_user_id` - For querying posts by user
3. `idx_posts_created_at` - For sorting posts chronologically (DESC)

**Sample Data:**
```sql
id | user_id | content                              | created_at
---+---------+--------------------------------------+-------------------------
1  | 1       | Hello world! My first post.          | 2025-11-01 10:30:00
2  | 2       | Excited to be here!                  | 2025-11-02 12:00:00
3  | 1       | Having a great day!                  | 2025-11-03 09:15:00
```

---

### 3. Follows Table

**Purpose:** Track follower-followee relationships between users

```sql
CREATE TABLE follows (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id != followee_id)
);

-- Indexes for performance
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followee ON follows(followee_id);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `follower_id` | INTEGER | PK, NOT NULL, FK | User who is following |
| `followee_id` | INTEGER | PK, NOT NULL, FK | User being followed |
| `created_at` | TIMESTAMP | DEFAULT NOW | Relationship creation timestamp |

**Composite Primary Key:**
- `(follower_id, followee_id)` - Ensures one user can only follow another user once

**Foreign Keys:**
- `follower_id` → `users(id)` with `ON DELETE CASCADE`
- `followee_id` → `users(id)` with `ON DELETE CASCADE`
  - When a user is deleted, all follow relationships are automatically deleted

**Check Constraints:**
- `CHECK (follower_id != followee_id)` - Prevents users from following themselves

**Indexes:**
1. Composite primary key index (automatic)
2. `idx_follows_follower` - For querying who a user is following
3. `idx_follows_followee` - For querying a user's followers

**Sample Data:**
```sql
follower_id | followee_id | created_at
------------+-------------+-------------------------
1           | 2           | 2025-11-01 11:00:00
1           | 3           | 2025-11-01 11:30:00
2           | 1           | 2025-11-02 13:00:00
3           | 2           | 2025-11-03 15:00:00
```

**Interpretation:**
- User 1 (demo) follows User 2 (alice) and User 3 (bob)
- User 2 (alice) follows User 1 (demo)
- User 3 (bob) follows User 2 (alice)

---

## 🔗 Relationships

### One-to-Many Relationships

1. **Users → Posts** (1:N)
   - One user can create many posts
   - Each post belongs to exactly one user
   - Cascade delete: Deleting a user deletes all their posts

2. **Users → Follows (as follower)** (1:N)
   - One user can follow many other users
   - Cascade delete: Deleting a user removes all their follow actions

3. **Users → Follows (as followee)** (1:N)
   - One user can be followed by many other users
   - Cascade delete: Deleting a user removes all follows to them

---

## 🚀 Query Patterns & Optimizations

### Common Queries

**1. Get User's Posts (optimized with index)**
```sql
SELECT * FROM posts 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT $2 OFFSET $3;
```
- Uses: `idx_posts_user_id`, `idx_posts_created_at`

---

**2. Get Personalized Feed (posts from followed users)**
```sql
SELECT p.*, u.username 
FROM posts p
JOIN follows f ON f.followee_id = p.user_id
JOIN users u ON u.id = p.user_id
WHERE f.follower_id = $1
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;
```
- Uses: `idx_follows_follower`, `idx_posts_user_id`, `idx_posts_created_at`

---

**3. Get User's Followers**
```sql
SELECT u.* 
FROM users u
JOIN follows f ON f.follower_id = u.id
WHERE f.followee_id = $1;
```
- Uses: `idx_follows_followee`

---

**4. Get Users That Current User Follows**
```sql
SELECT u.* 
FROM users u
JOIN follows f ON f.followee_id = u.id
WHERE f.follower_id = $1;
```
- Uses: `idx_follows_follower`

---

**5. Check if User A Follows User B**
```sql
SELECT EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = $1 AND followee_id = $2
);
```
- Uses: Composite primary key index

---

**6. List All Users with Follow Status**
```sql
SELECT 
    u.id,
    u.username,
    u.created_at,
    CASE 
        WHEN f.follower_id IS NOT NULL THEN true 
        ELSE false 
    END as is_following
FROM users u
LEFT JOIN follows f ON f.followee_id = u.id AND f.follower_id = $1
WHERE u.id != $1;
```
- Uses: User table scan with optional follow join

---

## 🔐 Security Considerations

### SQL Injection Prevention
- ✅ **Parameterized queries** used throughout application
- ✅ **No string concatenation** for SQL queries
- ✅ **Input validation** on application layer

**Example (Safe):**
```javascript
const result = await pool.query(
  'SELECT * FROM users WHERE username = $1',
  [username]
);
```

**Example (UNSAFE - Never do this):**
```javascript
// ❌ VULNERABLE TO SQL INJECTION
const result = await pool.query(
  `SELECT * FROM users WHERE username = '${username}'`
);
```

### Password Security
- ✅ Passwords hashed with **bcrypt** (10 rounds)
- ✅ Password hashes stored, never plain text
- ✅ Minimum password length enforced (6 characters)

### Data Integrity
- ✅ Foreign key constraints prevent orphaned records
- ✅ Unique constraints prevent duplicate usernames
- ✅ Check constraints prevent invalid data (e.g., self-follows)
- ✅ NOT NULL constraints ensure required fields

---

## 📈 Performance Optimization

### Indexing Strategy

**Why these indexes?**

1. **`idx_posts_user_id`** - User profile page loads all user's posts
2. **`idx_posts_created_at DESC`** - Feed always shows newest posts first
3. **`idx_follows_follower`** - "Following" list queries
4. **`idx_follows_followee`** - "Followers" list queries

### Query Performance Tips

1. **Use LIMIT and OFFSET** for pagination
   ```sql
   LIMIT 10 OFFSET 0  -- Page 1
   LIMIT 10 OFFSET 10 -- Page 2
   ```

2. **Avoid SELECT \*** in production (specify columns needed)
   ```sql
   SELECT id, username, created_at FROM users;  -- Better
   ```

3. **Use EXISTS** for boolean checks instead of COUNT
   ```sql
   SELECT EXISTS(SELECT 1 FROM follows WHERE ...)  -- Faster
   ```

### Expected Performance

- **User login:** < 50ms (indexed username lookup)
- **Get feed (10 posts):** < 100ms (optimized join with indexes)
- **Create post:** < 20ms (simple insert)
- **Follow/unfollow:** < 30ms (indexed composite key)

---

## 🔄 Migration Strategy

### Migration Files Location
```
backend/src/database/migrate.js
```

### Running Migrations

**Development:**
```bash
npm run migrate
```

**Production:**
```bash
NODE_ENV=production npm run migrate
```

### Migration Order
1. Create `users` table (no dependencies)
2. Create `posts` table (depends on users)
3. Create `follows` table (depends on users)

---

## 🌱 Seeding Data

### Seed Script Location
```
backend/src/database/seed.js
```

### Running Seeds

```bash
npm run seed
```

### Seed Data Created
- 3 test users (demo, alice, bob)
- 6 sample posts
- 3 follow relationships

**Test Accounts:**
- Username: `demo`, Password: `demo123`
- Username: `alice`, Password: `alice123`
- Username: `bob`, Password: `bob123`

---

## 📊 Database Statistics

### Expected Data Growth

| Users | Posts/Day | Storage/Year | Notes |
|-------|-----------|--------------|-------|
| 100 | 1,000 | ~50 MB | Small community |
| 1,000 | 10,000 | ~500 MB | Medium community |
| 10,000 | 100,000 | ~5 GB | Large community |

**Assumptions:**
- Average post size: 100 characters
- Indexes: ~30% overhead
- No media files (text only)

---

## 🛠️ Maintenance

### Regular Tasks

**1. Analyze Tables (weekly)**
```sql
ANALYZE users;
ANALYZE posts;
ANALYZE follows;
```

**2. Vacuum Database (monthly)**
```sql
VACUUM ANALYZE;
```

**3. Check Index Usage**
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

**4. Monitor Table Sizes**
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔮 Future Enhancements

### Potential Schema Extensions

1. **Comments System**
   ```sql
   CREATE TABLE comments (
       id SERIAL PRIMARY KEY,
       post_id INTEGER REFERENCES posts(id),
       user_id INTEGER REFERENCES users(id),
       content VARCHAR(200),
       created_at TIMESTAMP
   );
   ```

2. **Likes/Reactions**
   ```sql
   CREATE TABLE likes (
       user_id INTEGER REFERENCES users(id),
       post_id INTEGER REFERENCES posts(id),
       created_at TIMESTAMP,
       PRIMARY KEY (user_id, post_id)
   );
   ```

3. **User Profiles**
   ```sql
   ALTER TABLE users ADD COLUMN bio VARCHAR(160);
   ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
   ALTER TABLE users ADD COLUMN location VARCHAR(100);
   ```

4. **Direct Messages**
   ```sql
   CREATE TABLE messages (
       id SERIAL PRIMARY KEY,
       sender_id INTEGER REFERENCES users(id),
       receiver_id INTEGER REFERENCES users(id),
       content TEXT,
       read_at TIMESTAMP,
       created_at TIMESTAMP
   );
   ```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Index Best Practices](https://use-the-index-luke.com/)
- [Database Normalization Guide](https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-database-normalization/)

---

## 🔗 Related Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Testing Guide](../backend/TESTING.md)
- [Deployment Guide](DEPLOYMENT.md)
