const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const AuthService = require("./authService");

class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @returns {Object} - Registration result
   */
  static async registerUser(userData) {
    try {
      const { username, email, password } = userData;

      if (!username || !email || !password) {
        return {
          success: false,
          error: "Username, email, and password are required",
          statusCode: 400
        };
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return {
          success: false,
          error: "Username already exists",
          statusCode: 400
        };
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return {
          success: false,
          error: "Email already exists",
          statusCode: 400
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      // Generate token
      const token = AuthService.generateToken(user._id);

      // Return user data without password
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
        isAvatarImageSet: user.isAvatarImageSet
      };

      return {
        success: true,
        user: userResponse,
        token,
        statusCode: 201
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to register user",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Login user
   * @param {Object} loginData - Login data
   * @param {string} loginData.username - Username
   * @param {string} loginData.password - Password
   * @returns {Object} - Login result
   */
  static async loginUser(loginData) {
    try {
      const { username, password } = loginData;

      if (!username || !password) {
        return {
          success: false,
          error: "Username and password are required",
          statusCode: 400
        };
      }

      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        return {
          success: false,
          error: "Invalid username or password",
          statusCode: 401
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid username or password",
          statusCode: 401
        };
      }

      // Generate token
      const token = AuthService.generateToken(user._id);

      // Return user data without password
      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage,
        isAvatarImageSet: user.isAvatarImageSet
      };

      return {
        success: true,
        user: userResponse,
        token,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to login user",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get all users except current user
   * @param {string} currentUserId - Current user ID
   * @returns {Object} - Users result
   */
  static async getAllUsers(currentUserId) {
    try {
      if (!currentUserId) {
        return {
          success: false,
          error: "Current user ID is required",
          statusCode: 400
        };
      }

      const users = await User.find({ _id: { $ne: currentUserId } }).select([
        "username",
        "avatarImage",
        "_id",
        "isAvatarImageSet"
      ]).lean();

      return {
        success: true,
        users,
        currentUserId,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get users",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} - Profile result
   */
  static async getUserProfile(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400
        };
      }

      const user = await User.findById(userId).select([
        "username",
        "email",
        "avatarImage",
        "isAvatarImageSet",
        "_id"
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
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get user profile",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.username - New username (optional)
   * @param {string} updateData.email - New email (optional)
   * @returns {Object} - Update result
   */
  static async updateUserProfile(userId, updateData) {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400
        };
      }

      const { username, email } = updateData;

      // Check if username is already taken by another user
      if (username) {
        const existingUser = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUser) {
          return {
            success: false,
            error: "Username already taken",
            statusCode: 400
          };
        }
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
          return {
            success: false,
            error: "Email already taken",
            statusCode: 400
          };
        }
      }

      const updateFields = {};
      if (username) updateFields.username = username;
      if (email) updateFields.email = email;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true }
      ).select([
        "username",
        "email",
        "avatarImage",
        "isAvatarImageSet",
        "_id"
      ]);

      if (!updatedUser) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404
        };
      }

      return {
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update user profile",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Password data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Object} - Password change result
   */
  static async changePassword(userId, passwordData) {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400
        };
      }

      const { currentPassword, newPassword } = passwordData;

      if (!currentPassword || !newPassword) {
        return {
          success: false,
          error: "Current password and new password are required",
          statusCode: 400
        };
      }

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: "Current password is incorrect",
          statusCode: 400
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.findByIdAndUpdate(userId, {
        password: hashedNewPassword
      });

      return {
        success: true,
        message: "Password changed successfully",
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to change password",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @param {string} password - User password for verification
   * @returns {Object} - Account deletion result
   */
  static async deleteAccount(userId, password) {
    try {
      if (!userId || !password) {
        return {
          success: false,
          error: "User ID and password are required",
          statusCode: 400
        };
      }

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Password is incorrect",
          statusCode: 400
        };
      }

      // Delete user
      await User.findByIdAndDelete(userId);

      return {
        success: true,
        message: "Account deleted successfully",
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete account",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Set user avatar
   * @param {string} userId - User ID
   * @param {string} avatarImage - Avatar image URL
   * @returns {Object} - Avatar setting result
   */
  static async setAvatar(userId, avatarImage) {
    try {
      if (!userId || !avatarImage) {
        return {
          success: false,
          error: "User ID and avatar image are required",
          statusCode: 400
        };
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      ).select(['isAvatarImageSet', 'avatarImage']);

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404
        };
      }

      return {
        success: true,
        isSet: user.isAvatarImageSet,
        image: user.avatarImage,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to set avatar",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Search users by username
   * @param {string} searchTerm - Search term
   * @param {string} currentUserId - Current user ID (to exclude from results)
   * @returns {Object} - Search result
   */
  static async searchUsers(searchTerm, currentUserId) {
    try {
      if (!searchTerm) {
        return {
          success: false,
          error: "Search term is required",
          statusCode: 400
        };
      }

      const users = await User.find({
        username: { $regex: searchTerm, $options: 'i' },
        _id: { $ne: currentUserId }
      }).select([
        "username",
        "avatarImage",
        "_id",
        "isAvatarImageSet"
      ]).limit(10);

      return {
        success: true,
        users,
        count: users.length,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to search users",
        details: error.message,
        statusCode: 500
      };
    }
  }
}

module.exports = UserService;
