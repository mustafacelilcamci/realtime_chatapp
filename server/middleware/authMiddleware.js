const AuthService = require("../services/authService");

/**
 * Middleware to authenticate user requests
 * Adds user information to req.user if authentication is successful
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authResult = await AuthService.authenticateUser(req);
    
    if (!authResult.success) {
      return res.status(authResult.statusCode || 401).json({
        status: false,
        msg: authResult.error
      });
    }
    
    // Add user information to request object
    req.user = authResult.user;
    req.token = authResult.token;
    
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      msg: "Authentication middleware error"
    });
  }
};

/**
 * Middleware to check if user has permission to access a resource
 * @param {string} resourceType - Type of resource (e.g., 'message', 'user')
 * @param {string} action - Action being performed (e.g., 'read', 'write', 'delete')
 */
const checkPermission = (resourceType, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const resourceId = req.params.id || req.body.id;
      
      const permissionResult = await AuthService.validatePermission(
        userId, 
        resourceId, 
        action
      );
      
      if (!permissionResult.success) {
        return res.status(permissionResult.statusCode || 403).json({
          status: false,
          msg: permissionResult.error
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        status: false,
        msg: "Permission check error"
      });
    }
  };
};

/**
 * Middleware to validate request body
 * @param {Array} requiredFields - Array of required field names
 */
const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: false,
        msg: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware to handle errors
 */
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: false,
      msg: 'Validation error',
      details: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      status: false,
      msg: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      status: false,
      msg: 'Duplicate field value'
    });
  }
  
  // Default error response
  return res.status(500).json({
    status: false,
    msg: 'Internal server error'
  });
};

/**
 * Middleware to log requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * Middleware to rate limiting (basic implementation)
 */
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      const userRequests = requests.get(ip);
      
      if (now > userRequests.resetTime) {
        userRequests.count = 1;
        userRequests.resetTime = now + windowMs;
      } else {
        userRequests.count++;
      }
      
      if (userRequests.count > maxRequests) {
        return res.status(429).json({
          status: false,
          msg: 'Too many requests, please try again later'
        });
      }
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  checkPermission,
  validateRequest,
  errorHandler,
  requestLogger,
  rateLimiter
};
