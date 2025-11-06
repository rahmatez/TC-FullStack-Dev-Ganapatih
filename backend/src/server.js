require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

console.log('🚀 Starting News Feed API...');
console.log('📝 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Database:', process.env.DB_HOST || 'not configured');
console.log('🔧 PORT from env:', process.env.PORT);

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const followRoutes = require('./routes/follow');
const feedRoutes = require('./routes/feed');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();
// Parse PORT as integer to ensure it's a number
const PORT = parseInt(process.env.PORT) || 5000;

console.log('🎯 Using PORT:', PORT);

// Security middleware
app.use(helmet());

// CORS configuration - Support multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://tc-full-stack-dev-ganapatih.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'News Feed API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const HOST = process.env.HOST || '0.0.0.0';
  
  // Safety check: ensure PORT is not DB_PORT
  if (PORT === parseInt(process.env.DB_PORT)) {
    console.error('❌ ERROR: PORT cannot be same as DB_PORT!');
    console.error('   PORT:', PORT, '(should be web server port)');
    console.error('   DB_PORT:', process.env.DB_PORT, '(database port)');
    console.error('   Check Railway environment variables!');
    process.exit(1);
  }
  
  app.listen(PORT, HOST, () => {
    console.log(`✅ Server is running on ${HOST}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Public URL: https://rahmatez-tc-fullstack-dev-production.up.railway.app`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
