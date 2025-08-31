const UserService = require("../services/userService");
const { authenticateToken } = require("../middleware/authMiddleware");

module.exports.login = async (req, res, next) => {
  try {
    const result = await UserService.loginUser(req.body);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { user: result.user, token: result.token } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const result = await UserService.registerUser(req.body);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { user: result.user, token: result.token } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await UserService.getAllUsers(req.user._id);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { users: result.users, currentUserId: result.currentUserId } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const result = await UserService.setAvatar(req.user._id, req.body.image);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { isSet: result.isSet, image: result.image } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    // Remove user from online users (if you have this functionality)
    // onlineUsers.delete(req.user._id);
    
    return res.json({ 
      status: true, 
      msg: "User logged out successfully" 
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    const result = await UserService.getUserProfile(req.user._id);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { user: result.user } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const result = await UserService.updateUserProfile(req.user._id, req.body);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { user: result.user, msg: result.message } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    const result = await UserService.changePassword(req.user._id, req.body);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { msg: result.message } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.deleteAccount = async (req, res, next) => {
  try {
    const result = await UserService.deleteAccount(req.user._id, req.body.password);
    
    return res.status(result.statusCode).json({
      status: result.success,
      ...(result.success ? { msg: result.message } : { msg: result.error })
    });
  } catch (ex) {
    next(ex);
  }
};
