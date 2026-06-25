# 🚀 Deployment Guide

Complete guide for deploying the News Feed System to production.

---

## 🌐 Deployment Architecture

```
┌─────────────────────┐
│   Frontend (Vercel) │
│   Next.js App       │
│   Port: 443 (HTTPS) │
└──────────┬──────────┘
           │
           │ HTTPS/REST API
           ▼
┌─────────────────────┐
│  Backend (Railway)  │
│  Express API        │
│  Port: 5000         │
└──────────┬──────────┘
           │
           │ PostgreSQL
           ▼
┌─────────────────────┐
│  Database (Railway) │
│  PostgreSQL 15      │
│  Port: 5432         │
└─────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] Strong JWT secrets generated (min 32 characters)
- [ ] Database passwords are strong and unique
- [ ] Environment variables are properly set
- [ ] CORS is configured for production domain
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Production build succeeds (`npm run build`)

### Database
- [ ] Migrations tested locally
- [ ] Seed data prepared (if needed)
- [ ] Database backup strategy in place

---

## 🎯 Deployment Options

### Option 1: Vercel + Railway (Recommended)
- **Frontend:** Vercel (Free tier available)
- **Backend + Database:** Railway (Free tier: $5 credit/month)
- **Pros:** Easy setup, auto-deploy, good free tier
- **Cons:** Limited free resources

### Option 2: Vercel + Render
- **Frontend:** Vercel
- **Backend + Database:** Render (Free tier available)
- **Pros:** Generous free tier for database
- **Cons:** Cold starts on free tier

### Option 3: Netlify + Heroku
- **Frontend:** Netlify
- **Backend + Database:** Heroku
- **Pros:** Mature platforms, good documentation
- **Cons:** Heroku no longer has free tier

---

## 🚂 Backend Deployment (Railway)

### Step 1: Prepare Backend

**1. Create `railway.json` in backend folder:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**2. Ensure `start` script in `package.json`:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "migrate": "node src/database/migrate.js"
  }
}
```

---

### Step 2: Deploy to Railway

**1. Create Railway Account:**
- Visit [railway.app](https://railway.app)
- Sign up with GitHub

**2. Create New Project:**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Select `backend` folder as root directory

**3. Add PostgreSQL Database:**
- In project dashboard, click "New"
- Select "Database" → "PostgreSQL"
- Wait for provisioning

**4. Configure Environment Variables:**

Go to backend service → Variables:

```env
# Database (auto-filled by Railway)
DATABASE_URL=${DATABASE_URL}  # Railway provides this

# Manual configuration
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS (add your Vercel domain later)
FRONTEND_URL=https://your-app.vercel.app
```

**5. Run Migrations:**

In Railway dashboard:
- Go to backend service
- Click "Settings" → "Deploy"
- Add "Deploy command": `npm run migrate`
- Or manually run via Railway CLI:
  ```bash
  railway run npm run migrate
  ```

**6. Deploy:**
- Railway auto-deploys on push to main branch
- Or click "Deploy" button manually

**7. Get Backend URL:**
- Go to "Settings" → "Networking"
- Click "Generate Domain"
- Copy your backend URL: `https://your-app.up.railway.app`

---

## ▲ Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

**1. Update `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

**2. Create `vercel.json` (optional):**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

---

### Step 2: Deploy to Vercel

**1. Create Vercel Account:**
- Visit [vercel.com](https://vercel.com)
- Sign up with GitHub

**2. Import Repository:**
- Click "New Project"
- Import your GitHub repository
- Select `frontend` folder as root directory

**3. Configure Build Settings:**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

**4. Set Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

Replace `your-backend.up.railway.app` with your Railway backend URL.

**5. Deploy:**
- Click "Deploy"
- Wait for build to complete (~2-3 minutes)

**6. Get Frontend URL:**
- Copy your frontend URL: `https://your-app.vercel.app`

---

### Step 3: Update Backend CORS

**1. Go to Railway dashboard**

**2. Update `FRONTEND_URL` environment variable:**
```env
FRONTEND_URL=https://your-app.vercel.app
```

**3. Redeploy backend** (Railway auto-redeploys on env change)

---

## 🔄 CI/CD Setup (GitHub Actions)

### Current Workflow

The project includes `.github/workflows/ci.yml` that runs:
- Linting
- Tests
- Build validation

**On every push and pull request:**
1. Backend tests (with PostgreSQL service)
2. Frontend tests
3. Docker build verification

---

## 🗄️ Database Management

### Backup Strategy

**Option 1: Railway Backups**
- Railway Pro plan includes automatic daily backups
- Free tier: No automatic backups

**Option 2: Manual Backups**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Create backup
railway run pg_dump -Fc > backup.dump

# Restore backup
railway run pg_restore -d DATABASE_URL backup.dump
```

**Option 3: Scheduled Backups Script**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL -Fc > "backup_$DATE.dump"
# Upload to S3, Google Cloud Storage, etc.
```

---

### Database Migrations in Production

**Manual Migration:**
```bash
# Using Railway CLI
railway run npm run migrate

# Or set as deploy command in railway.json
```

**Automated Migration:**

Update `railway.json`:
```json
{
  "deploy": {
    "startCommand": "npm run migrate && npm start"
  }
}
```

⚠️ **Warning:** Be careful with migrations in production. Test thoroughly first.

---

## 🔐 Environment Variables Management

### Backend Environment Variables

**Railway Dashboard:**
1. Project → Backend Service
2. Variables tab
3. Add each variable
4. Click "Deploy"

**Essential Variables:**
```env
# Database (Railway auto-fills these)
PGHOST=<auto>
PGPORT=<auto>
PGDATABASE=<auto>
PGUSER=<auto>
PGPASSWORD=<auto>

# JWT (Generate strong secrets)
JWT_SECRET=<use strong random string>
JWT_REFRESH_SECRET=<use different strong random string>

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-app.vercel.app
```

**Generate Strong Secrets:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online
# Use: https://generate-secret.vercel.app/32
```

---

### Frontend Environment Variables

**Vercel Dashboard:**
1. Project → Settings
2. Environment Variables
3. Add `NEXT_PUBLIC_API_URL`
4. Redeploy

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

⚠️ **Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 🏥 Health Checks & Monitoring

### Health Check Endpoint

Your backend includes a health check:

```
GET https://your-backend.up.railway.app/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "News Feed API is running",
  "timestamp": "2025-11-08T10:00:00.000Z"
}
```

---

### Monitoring Services

**1. Railway Built-in:**
- Go to "Observability" tab
- View logs, metrics, CPU, memory usage

**2. Uptime Monitoring (Free):**
- [UptimeRobot](https://uptimerobot.com)
- [StatusCake](https://www.statuscake.com)
- Configure to ping `/health` every 5 minutes

**3. Error Tracking:**
- [Sentry](https://sentry.io) - Free tier available
- Add to backend:
  ```bash
  npm install @sentry/node
  ```

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Database connection failed**

Solutions:
1. Check DATABASE_URL is set correctly
2. Verify database is running (Railway dashboard)
3. Check if migrations ran successfully
4. Review logs: `railway logs`

---

**Error: Port already in use**

Railway assigns PORT automatically. Ensure:
```javascript
const PORT = process.env.PORT || 5000;
```

---

**Error: JWT token issues**

1. Verify JWT_SECRET is set
2. Check token expiration times
3. Ensure CORS allows your frontend domain

---

### Frontend Issues

**Error: API calls failing**

Solutions:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS on backend allows your domain
3. Inspect Network tab in browser DevTools
4. Check if backend is healthy: `/health`

---

**Error: Build failed on Vercel**

Common causes:
1. TypeScript errors (run `npm run build` locally first)
2. Missing dependencies
3. Environment variables not set
4. Check Vercel build logs for specifics

---

### CORS Issues

**Symptoms:**
- API calls work in development but fail in production
- Browser console shows CORS errors

**Solutions:**

1. **Add frontend domain to backend CORS:**
   ```javascript
   // backend/src/server.js
   const allowedOrigins = [
     process.env.FRONTEND_URL,
     'https://your-app.vercel.app',
   ];
   ```

2. **Update Railway environment:**
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. **Redeploy backend**

---

## 📊 Performance Optimization

### Backend

**1. Enable Gzip Compression:**
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

**2. Database Connection Pooling:**

Already implemented in `backend/src/database/db.js`:
```javascript
const pool = new Pool({
  max: 20,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**3. Add Caching (optional):**
```bash
npm install node-cache
```

---

### Frontend

**1. Enable Next.js Optimizations:**

Already configured:
- Image optimization
- Code splitting
- Static generation where possible

**2. Enable Vercel Analytics:**
- Go to Vercel Dashboard
- Project → Analytics
- Enable (Free for hobby projects)

---

## 🔒 Security Best Practices

### Production Checklist

- [x] HTTPS enabled (automatic on Vercel/Railway)
- [x] Strong JWT secrets (min 32 characters)
- [x] CORS restricted to specific origins
- [x] Rate limiting enabled (100 req/15min)
- [x] Helmet security headers active
- [x] Input validation on all endpoints
- [x] SQL injection prevention (parameterized queries)
- [x] Password hashing (bcrypt)
- [ ] CSP headers (optional, add if needed)
- [ ] DDoS protection (consider Cloudflare)

---

### Recommended: Add CSP Headers

```javascript
// backend/src/server.js
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
);
```

---

## 📈 Scaling Considerations

### When to Scale

**Signs you need to scale:**
- Response times > 1 second
- Database connection pool exhausted
- High CPU usage (> 80% sustained)
- Memory issues

### Scaling Options

**1. Vertical Scaling (Easier):**
- Railway: Upgrade plan for more resources
- Increase database connection pool size

**2. Horizontal Scaling (More complex):**
- Multiple backend instances
- Load balancer
- Redis for session management
- Read replicas for database

---

## 📚 Additional Resources

### Documentation
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Tools
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 🎉 Post-Deployment

### Verification Steps

**1. Test all endpoints:**
```bash
# Health check
curl https://your-backend.up.railway.app/health

# Register
curl -X POST https://your-backend.up.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Login
curl -X POST https://your-backend.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**2. Test frontend:**
- Visit `https://your-app.vercel.app`
- Register new account
- Create a post
- Follow other users
- Check feed

**3. Monitor for 24 hours:**
- Check error logs
- Monitor response times
- Verify health checks passing

---

## 🔄 Continuous Deployment

### Automatic Deployments

**Railway:**
- Automatically deploys on push to `main` branch
- Configure in Settings → "Deploy on commit"

**Vercel:**
- Automatically deploys on push to `main` branch
- Preview deployments for pull requests
- Configure in Settings → Git Integration

---

## 🆘 Support & Help

**Issues:**
- [GitHub Issues](https://github.com/rahmatez/TC-FullStack-Dev-Ganapatih/issues)
- Email: rahmatezdev@gmail.com

**Platform Support:**
- [Railway Discord](https://discord.gg/railway)
- [Vercel Support](https://vercel.com/support)

---

## 📝 Deployment Checklist Summary

```markdown
Pre-Deployment:
- [ ] All tests passing
- [ ] Strong secrets generated
- [ ] Environment variables documented
- [ ] Database migrations tested

Backend (Railway):
- [ ] Project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Migrations ran successfully
- [ ] Domain generated
- [ ] Health check passing

Frontend (Vercel):
- [ ] Project imported
- [ ] NEXT_PUBLIC_API_URL set
- [ ] Build successful
- [ ] Domain assigned

Post-Deployment:
- [ ] Backend CORS updated with frontend URL
- [ ] Full user flow tested
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Documentation updated with URLs
```

---

🎊 **Congratulations!** Your News Feed System is now live in production!
