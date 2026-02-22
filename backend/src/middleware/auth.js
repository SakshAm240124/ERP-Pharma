const jwt = require('jsonwebtoken');
const User = require('../models/sequelize/user');
const config = require('../config/config');

/**
 * Middleware to protect routes - verifies JWT token
 * TEMPORARILY DISABLED FOR DEVELOPMENT - will allow all requests
 */
exports.protect = async (req, res, next) => {
  try {
    // TEMPORARY: Skip authentication for development
    req.user = { id: 1, name: 'Test User', role: 'Admin' };
    return next();
    
    // Original code below
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }
      
      // Check if user is active
      if (user.status !== 'Active') {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 * TEMPORARILY DISABLED FOR DEVELOPMENT - will allow all roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // TEMPORARY: Skip role check for development
    return next();
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 