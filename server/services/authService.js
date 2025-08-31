const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

class AuthService {
  /**
   * Verify JWT token and extract user information
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  static verifyToken(token) {
    try {
      if (!token) {
        throw new Error("No token provided");
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, user: decoded };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.name === 'JsonWebTokenError' ? 'INVALID_TOKEN' : 'TOKEN_EXPIRED'
      };
    }
  }

  /**
   * Extract token from Authorization header
   * @param {Object} headers - Request headers
   * @returns {string|null} - Token or null
   */
  static extractTokenFromHeader(headers) {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.replace('Bearer ', '');
  }

  /**
   * Authenticate user from request
   * @param {Object} req - Express request object
   * @returns {Object} - Authentication result
   */
  static async authenticateUser(req) {
    try {
      const token = this.extractTokenFromHeader(req.headers);
      
      if (!token) {
        return {
          success: false,
          error: "Access token required",
          statusCode: 401
        };
      }

      const tokenResult = this.verifyToken(token);
      
      if (!tokenResult.success) {
        return {
          success: false,
          error: tokenResult.error,
          statusCode: 401,
          code: tokenResult.code
        };
      }

      // Get user from database
      const user = await User.findById(tokenResult.user.userId).select([
        "_id",
        "username",
        "email",
        "avatarImage",
        "isAvatarImageSet"
      ]);

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404
        };
      }

      return {
        success: true,
        user,
        token: tokenResult.user
      };
    } catch (error) {
      return {
        success: false,
        error: "Authentication failed",
        statusCode: 500
      };
    }
  }

  /**
   * Generate JWT token for user
   * @param {string} userId - User ID
   * @param {string} expiresIn - Token expiration time
   * @returns {string} - JWT token
   */
  static generateToken(userId, expiresIn = '24h') {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
  }

  /**
   * Check if user exists and is active
   * @param {string} userId - User ID
   * @returns {Object} - User check result
   */
  static async checkUserExists(userId) {
    try {
      const user = await User.findById(userId);
      return {
        success: !!user,
        user: user || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate user permissions for specific action
   * @param {string} userId - User ID
   * @param {string} resourceId - Resource ID (e.g., message ID)
   * @param {string} action - Action type (e.g., 'delete', 'edit')
   * @returns {Object} - Permission check result
   */
  static async validatePermission(userId, resourceId, action) {
    try {
      // For now, basic permission check
      // In the future, you can add role-based permissions here
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      return {
        success: false,
        error: "Permission validation failed",
        statusCode: 500
      };
    }
  }
}

module.exports = AuthService;
