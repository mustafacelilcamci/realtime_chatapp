const router = require("express").Router();
const { addMessage, getMessages, deleteMessage, getConversations, upload } = require("../controllers/messageController");

/**
 * @swagger
 * /api/messages/addmsg:
 *   post:
 *     summary: Send a message (text and/or image)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient user ID
 *                 example: "507f1f77bcf86cd799439012"
 *               message:
 *                 type: string
 *                 description: Message text (optional if image is provided)
 *                 example: "Check out this photo!"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (optional if message text is provided)
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                   example: "Message added successfully"
 *                 message:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Message ID
 *                     message:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                           description: Message text
 *                         image:
 *                           type: string
 *                           description: Image file path
 *                         type:
 *                           type: string
 *                           enum: [text, image, mixed]
 *                           description: Message type
 *                     sender:
 *                       type: string
 *                       description: Sender user ID
 *                     time:
 *                       type: string
 *                       format: date-time
 *                       description: Message timestamp
 *       400:
 *         description: Bad request - Missing required fields or invalid file
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
 *                   example: "Message text or image is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       413:
 *         description: File too large (max 5MB)
 */
router.post("/addmsg", upload.single('image'), addMessage);

/**
 * @swagger
 * /api/messages/getmsg:
 *   post:
 *     summary: Get messages between current user and another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *             properties:
 *               from:
 *                 type: string
 *                 description: Other user's ID to get conversation with
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fromSelf:
 *                         type: boolean
 *                         description: Whether message is from current user
 *                       message:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                             description: Message text
 *                           image:
 *                             type: string
 *                             description: Image file path
 *                           type:
 *                             type: string
 *                             enum: [text, image, mixed]
 *                             description: Message type
 *                       time:
 *                         type: string
 *                         format: date-time
 *                         description: Message timestamp
 *                       _id:
 *                         type: string
 *                         description: Message ID
 *                 count:
 *                   type: integer
 *                   description: Number of messages
 *                   example: 15
 *       400:
 *         description: Bad request - Missing recipient ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post("/getmsg", getMessages);

/**
 * @swagger
 * /api/messages/delete/{messageId}:
 *   delete:
 *     summary: Delete a specific message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Message deleted successfully
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
 *                   example: "Message deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Can only delete own messages
 *       404:
 *         description: Message not found
 */
router.delete("/delete/:messageId", deleteMessage);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Other user's ID in conversation
 *                       lastMessage:
 *                         type: string
 *                         description: Last message in conversation (with emoji for images)
 *                         example: "Hello! 📷"
 *                       lastMessageTime:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of last message
 *                       messageCount:
 *                         type: integer
 *                         description: Total number of messages in conversation
 *                 count:
 *                   type: integer
 *                   description: Number of conversations
 *                   example: 5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/conversations", getConversations);

module.exports = router;
