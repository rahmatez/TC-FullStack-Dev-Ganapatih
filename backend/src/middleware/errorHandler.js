const errorHandler = (err, req, res, next) => {
  // Only log errors in non-test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired'
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(404).json({
      error: 'Not Found',
      message: 'Referenced resource not found'
    });
  }

  if (err.code === '23514') { // Check violation
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Data validation failed'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    message: err.userMessage || 'An unexpected error occurred'
  });
};

module.exports = errorHandler;
