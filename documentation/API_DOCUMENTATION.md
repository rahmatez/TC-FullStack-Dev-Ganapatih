# 📖 API Documentation

## Base URL
- **Production:** `https://rahmatez-tc-fullstack-dev-production.up.railway.app/api`
- **Local:** `http://localhost:5000/api`

## Authentication
Most endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

**Validation:**
- `username`: 3-50 characters, alphanumeric + underscore
- `password`: minimum 6 characters

---

### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

---

### Refresh Token
```http
POST /api/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 📝 Post Endpoints

### Create Post
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello world! This is my first post."
}
```

**Response (201):**
```json
{
  "id": 42,
  "userId": 1,
  "username": "john_doe",
  "content": "Hello world! This is my first post.",
  "createdAt": "2025-11-08T10:30:00.000Z"
}
```

**Validation:**
- `content`: required, max 200 characters

---

### Get Post by ID
```http
GET /api/posts/{postId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 42,
  "userId": 1,
  "username": "john_doe",
  "content": "Hello world!",
  "createdAt": "2025-11-08T10:30:00.000Z"
}
```

---

### Get My Posts
```http
GET /api/posts/user/me?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "page": 1,
  "posts": [
    {
      "id": 9,
      "userId": 1,
      "username": "john_doe",
      "content": "Sample content",
      "createdAt": "2025-11-08T08:30:00.000Z"
    }
  ]
}
```

**Query Parameters:**
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 50)

---

## 👥 User Endpoints

### List All Users
```http
GET /api/users
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 2,
    "username": "alice",
    "createdAt": "2025-11-05T12:00:00.000Z",
    "isFollowing": true
  },
  {
    "id": 3,
    "username": "bob",
    "createdAt": "2025-11-06T14:30:00.000Z",
    "isFollowing": false
  }
]
```

---

### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "created_at": "2025-11-01T11:00:00.000Z"
}
```

---

### Get User by ID
```http
GET /api/users/{userId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 2,
  "username": "alice",
  "created_at": "2025-11-05T12:00:00.000Z"
}
```

---

### Get User Posts
```http
GET /api/users/{userId}/posts?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 17,
    "user_id": 2,
    "username": "alice",
    "content": "Another update",
    "created_at": "2025-11-08T09:45:00.000Z"
  }
]
```

---

## 🔗 Follow System Endpoints

### Follow User
```http
POST /api/follow/{userId}
Authorization: Bearer {token}
```

**Response (201):**
```json
{
  "message": "You are now following user 2"
}
```

**Errors:**
- `400`: Cannot follow yourself
- `409`: Already following

---

### Unfollow User
```http
DELETE /api/follow/{userId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "You unfollowed user 2"
}
```

**Errors:**
- `400`: Cannot unfollow yourself
- `404`: Not following this user

---

### Check Follow Status
```http
GET /api/follow/check/{userId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "isFollowing": true
}
```

---

### Get Followers
```http
GET /api/follow/followers/{userId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "count": 2,
  "followers": [
    {
      "id": 5,
      "username": "bob",
      "followed_at": "2025-11-08T08:00:00.000Z"
    }
  ]
}
```

---

### Get Following
```http
GET /api/follow/following/{userId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "count": 1,
  "following": [
    {
      "id": 2,
      "username": "alice",
      "followed_at": "2025-11-08T08:00:00.000Z"
    }
  ]
}
```

---

## 📱 Feed Endpoint

### Get Personalized Feed
```http
GET /api/feed?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "posts": [
    {
      "id": 42,
      "userId": 2,
      "username": "alice",
      "content": "Latest update from someone I follow",
      "createdAt": "2025-11-08T10:30:00.000Z"
    }
  ]
}
```

**Query Parameters:**
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 50)

**Note:** Only shows posts from users you follow

---

## ⚕️ Health Check

### Health Status
```http
GET /health
```

**Response (200):**
```json
{
  "status": "OK",
  "message": "News Feed API is running",
  "timestamp": "2025-11-08T10:00:00.000Z"
}
```

---

## ❌ Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "username",
      "message": "Username must be 3-50 characters"
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "error": "Access denied"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**409 Conflict**
```json
{
  "error": "Username already exists"
}
```

**422 Unprocessable Entity**
```json
{
  "error": "Invalid request data"
}
```

**429 Too Many Requests**
```json
{
  "error": "Too many requests, please try again later"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## 🔒 Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## 📌 Best Practices

1. **Always include Content-Type header** for POST/PUT requests
2. **Store refresh tokens securely** (httpOnly cookies recommended)
3. **Implement token refresh logic** before access token expires
4. **Handle rate limiting** with exponential backoff
5. **Validate input on client side** before sending requests
6. **Use pagination** for list endpoints to improve performance

---

## 🧪 Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**Create Post:**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Hello from cURL!"}'
```

**Get Feed:**
```bash
curl -X GET http://localhost:5000/api/feed?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 Additional Resources

- [Setup Guide](SETUP_GUIDE.md)
- [Database Design](DATABASE_DESIGN.md)
- [Testing Guide](../backend/TESTING.md)
- [Deployment Guide](DEPLOYMENT.md)
