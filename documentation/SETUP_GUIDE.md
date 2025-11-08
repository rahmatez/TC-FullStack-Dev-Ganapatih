# 🔧 Setup Guide

Complete guide to set up the News Feed System locally or in production.

---

## 📋 Prerequisites

### Required
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

### Optional
- **Docker** & **Docker Compose** (for containerized setup)
- **Postman** or **Thunder Client** (for API testing)

---

## 🚀 Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih.git
cd TC-FullStack-Dev-Ganapatih
```

---

### Step 2: Setup PostgreSQL Database

#### Option A: Manual Setup

1. **Create Database:**
```sql
CREATE DATABASE newsfeed_db;
```

2. **Create User (optional):**
```sql
CREATE USER newsfeed_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE newsfeed_db TO newsfeed_user;
```

#### Option B: Using Docker

```bash
docker run --name postgres-newsfeed -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=newsfeed_db -p 5432:5432 -d postgres:15-alpine
```

---

### Step 3: Setup Backend

```bash
cd backend
npm install
```

**Create `.env` file:**
```bash
cp .env.example .env
```

**Edit `.env` with your configuration:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newsfeed_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (optional)
FRONTEND_URL=http://localhost:3000
```

**Run Database Migrations:**
```bash
npm run migrate
```

**Seed Database (optional):**
```bash
npm run seed
```

This creates test users:
- Username: `demo`, Password: `demo123`
- Username: `alice`, Password: `alice123`
- Username: `bob`, Password: `bob123`

**Start Backend Server:**
```bash
npm run dev
```

Backend will run at: `http://localhost:5000`

---

### Step 4: Setup Frontend

**Open new terminal:**
```bash
cd frontend
npm install
```

**Create `.env.local` file:**
```bash
cp .env.example .env.local
```

**Edit `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start Frontend Server:**
```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

### Step 5: Verify Setup

1. **Check Backend Health:**
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "News Feed API is running",
  "timestamp": "2025-11-08T10:00:00.000Z"
}
```

2. **Open Frontend:**
   - Navigate to `http://localhost:3000`
   - Try logging in with demo account:
     - Username: `demo`
     - Password: `demo123`

---

## 🐳 Docker Setup (Recommended)

### Using Docker Compose

**Start all services:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 5000)
- Frontend app (port 3000)

**View logs:**
```bash
docker-compose logs -f
```

**Stop services:**
```bash
docker-compose down
```

**Rebuild after changes:**
```bash
docker-compose up -d --build
```

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:coverage      # With coverage report
npm run test:watch         # Watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage      # With coverage report
npm run test:watch         # Watch mode
```

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error: `connect ECONNREFUSED`**

Solutions:
1. Verify PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo service postgresql status
   
   # Windows
   Get-Service postgresql*
   ```

2. Check database credentials in `.env`
3. Verify port 5432 is not blocked

**Error: `database "newsfeed_db" does not exist`**

Solution:
```bash
cd backend
npm run migrate
```

---

### Port Already in Use

**Backend (5000):**
```bash
# Find process
lsof -i :5000          # Mac/Linux
netstat -ano | findstr :5000    # Windows

# Kill process
kill -9 <PID>          # Mac/Linux
taskkill /PID <PID> /F # Windows
```

**Frontend (3000):**
```bash
# Find and kill process on port 3000
lsof -i :3000          # Mac/Linux
netstat -ano | findstr :3000    # Windows
```

---

### CORS Issues

If frontend can't connect to backend:

1. **Check CORS_ORIGIN in backend `.env`:**
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

2. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Clear browser cache** and hard reload (Ctrl+Shift+R)

---

### Migration Issues

**Error: `relation "users" already exists`**

Solutions:
1. Drop and recreate database:
   ```sql
   DROP DATABASE newsfeed_db;
   CREATE DATABASE newsfeed_db;
   ```

2. Run migrations again:
   ```bash
   npm run migrate
   ```

---

### Module Not Found Errors

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

---

## 🌐 Environment Variables Reference

### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_NAME` | Database name | `newsfeed_db` | Yes |
| `DB_USER` | Database user | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` | No |
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |

### Frontend (.env.local)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` | Yes |

---

## 📦 Scripts Reference

### Backend Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
npm run test:coverage # Run tests with coverage
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
```

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
```

---

## 🔐 Security Notes

### Development
- Use strong passwords even in development
- Never commit `.env` files to Git
- Keep dependencies updated: `npm audit fix`

### Production
- Use strong, unique JWT secrets (min 32 characters)
- Enable HTTPS
- Set `NODE_ENV=production`
- Use environment-specific credentials
- Enable rate limiting
- Set up monitoring and logging

---

## 📚 Next Steps

After successful setup:

1. 📖 Read [API Documentation](API_DOCUMENTATION.md)
2. 📋 Review [Database Design](DATABASE_DESIGN.md)
3. 🧪 Check [Testing Guide](../backend/TESTING.md)
4. 🚀 See [Deployment Guide](DEPLOYMENT.md)

---

## 🆘 Need Help?

- **Issues:** [GitHub Issues](https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih/issues)
- **Email:** rahmatezdev@gmail.com
