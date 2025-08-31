const router = require("express").Router();
const { 
  register, 
  login, 
  setAvatar, 
  getAllUsers, 
  logout, 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount 
} = require("../controllers/userController");
const { authenticateToken, validateRequest } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the account
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: User's password (min 8 characters)
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: "Username already exists"
 */
router.post("/register", validateRequest(['username', 'email', 'password']), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: "Invalid username or password"
 */
router.post("/login", validateRequest(['username', 'password']), login);

/**
 * @swagger
 * /api/auth/setavatar:
 *   post:
 *     summary: Set user avatar
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Avatar image URL or base64 data
 *                 example: "https://api.dicebear.com/7.x/avataaars/svg?seed=abc123"
 *     responses:
 *       200:
 *         description: Avatar set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSet:
 *                   type: boolean
 *                   example: true
 *                 image:
 *                   type: string
 *                   example: "https://api.dicebear.com/7.x/avataaars/svg?seed=abc123"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Failed to set avatar
 */
router.post("/setavatar", authenticateToken, validateRequest(['image']), setAvatar);

/**
 * @swagger
 * /api/auth/allusers:
 *   get:
 *     summary: Get all users except current user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 currentUserId:
 *                   type: string
 *                   description: Current user's ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Failed to get users
 */
router.get("/allusers", authenticateToken, getAllUsers);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "User logged out successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Logout failed
 */
router.get("/logout", authenticateToken, logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 */
router.get("/profile", authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: New username
 *                 example: "new_username"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address
 *                 example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Username or email already taken
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.put("/profile", authenticateToken, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 description: New password (min 8 characters)
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request - Current password incorrect or missing fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post("/change-password", authenticateToken, validateRequest(['currentPassword', 'newPassword']), changePassword);

/**
 * @swagger
 * /api/auth/delete-account:
 *   delete:
 *     summary: Delete user account
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password for verification
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       400:
 *         description: Bad request - Password incorrect or missing
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.delete("/delete-account", authenticateToken, validateRequest(['password']), deleteAccount);

module.exports = router;
