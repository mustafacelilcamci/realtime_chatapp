const Message = require("../models/messageModel");
const AuthService = require("./authService");
const path = require("path");
const fs = require("fs");

class MessageService {
  /**
   * Create a new message
   * @param {Object} messageData - Message data
   * @param {string} messageData.senderId - Sender user ID
   * @param {string} messageData.to - Recipient user ID
   * @param {string} messageData.text - Message text (optional)
   * @param {Object} messageData.imageFile - Image file (optional)
   * @returns {Object} - Created message result
   */
  static async createMessage(messageData) {
    try {
      const { senderId, to, text, imageFile } = messageData;

      if (!senderId || !to) {
        return {
          success: false,
          error: "Sender and recipient IDs are required",
          statusCode: 400
        };
      }

      if (!text && !imageFile) {
        return {
          success: false,
          error: "Message text or image is required",
          statusCode: 400
        };
      }

      let messageContent = {};

      // Determine message type and content
      if (imageFile && text) {
        messageContent = {
          text: text,
          image: `/uploads/${imageFile.filename}`,
          type: 'mixed'
        };
      } else if (imageFile) {
        messageContent = {
          image: `/uploads/${imageFile.filename}`,
          type: 'image'
        };
      } else {
        messageContent = {
          text: text,
          type: 'text'
        };
      }

      const newMessage = await Message.create({
        message: messageContent,
        users: [senderId, to],
        sender: senderId,
      });

      return {
        success: true,
        message: newMessage,
        statusCode: 201
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create message",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get messages between two users
   * @param {string} currentUserId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @returns {Object} - Messages result
   */
  static async getMessages(currentUserId, otherUserId) {
    try {
      if (!currentUserId || !otherUserId) {
        return {
          success: false,
          error: "Both user IDs are required",
          statusCode: 400
        };
      }

      const messages = await Message.find({
        users: {
          $all: [currentUserId, otherUserId],
        },
      }).sort({ updatedAt: 1 });

      const projectedMessages = messages.map((msg) => ({
        fromSelf: msg.sender.toString() === currentUserId,
        message: msg.message,
        time: msg.time,
        _id: msg._id
      }));

      return {
        success: true,
        messages: projectedMessages,
        count: projectedMessages.length,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get messages",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID requesting deletion
   * @returns {Object} - Deletion result
   */
  static async deleteMessage(messageId, userId) {
    try {
      if (!messageId || !userId) {
        return {
          success: false,
          error: "Message ID and user ID are required",
          statusCode: 400
        };
      }

      const message = await Message.findById(messageId);

      if (!message) {
        return {
          success: false,
          error: "Message not found",
          statusCode: 404
        };
      }

      if (message.sender.toString() !== userId) {
        return {
          success: false,
          error: "You can only delete your own messages",
          statusCode: 403
        };
      }

      // Delete associated image file if exists
      if (message.message.image) {
        const imagePath = path.join(__dirname, '..', message.message.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Message.findByIdAndDelete(messageId);

      return {
        success: true,
        message: "Message deleted successfully",
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete message",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get conversations for a user
   * @param {string} userId - User ID
   * @returns {Object} - Conversations result
   */
  static async getConversations(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400
        };
      }

      const conversations = await Message.aggregate([
        {
          $match: {
            users: { $in: [userId] }
          }
        },
        {
          $sort: { time: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$users.0", userId] },
                "$users.1",
                "$users.0"
              ]
            },
            lastMessage: { 
              $first: {
                $cond: [
                  { $eq: ["$message.type", "text"] },
                  "$message.text",
                  { $cond: [
                    { $eq: ["$message.type", "image"] },
                    "📷 Image",
                    { $concat: ["$message.text", " 📷"] }
                  ]}
                ]
              }
            },
            lastMessageTime: { $first: "$time" },
            messageCount: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        conversations,
        count: conversations.length,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get conversations",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Search messages by content
   * @param {string} userId - User ID
   * @param {string} searchTerm - Search term
   * @returns {Object} - Search result
   */
  static async searchMessages(userId, searchTerm) {
    try {
      if (!userId || !searchTerm) {
        return {
          success: false,
          error: "User ID and search term are required",
          statusCode: 400
        };
      }

      const messages = await Message.find({
        users: { $in: [userId] },
        "message.text": { $regex: searchTerm, $options: 'i' }
      }).sort({ time: -1 });

      const projectedMessages = messages.map((msg) => ({
        fromSelf: msg.sender.toString() === userId,
        message: msg.message,
        time: msg.time,
        _id: msg._id
      }));

      return {
        success: true,
        messages: projectedMessages,
        count: projectedMessages.length,
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to search messages",
        details: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get message statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} - Statistics result
   */
  static async getMessageStats(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400
        };
      }

      const stats = await Message.aggregate([
        {
          $match: {
            users: { $in: [userId] }
          }
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            sentMessages: {
              $sum: {
                $cond: [{ $eq: ["$sender", userId] }, 1, 0]
              }
            },
            receivedMessages: {
              $sum: {
                $cond: [{ $ne: ["$sender", userId] }, 1, 0]
              }
            },
            imageMessages: {
              $sum: {
                $cond: [
                  { $in: ["$message.type", ["image", "mixed"]] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return {
        success: true,
        stats: stats[0] || {
          totalMessages: 0,
          sentMessages: 0,
          receivedMessages: 0,
          imageMessages: 0
        },
        statusCode: 200
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get message statistics",
        details: error.message,
        statusCode: 500
      };
    }
  }
}

module.exports = MessageService;
