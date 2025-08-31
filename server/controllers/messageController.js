const Message = require("../models/messageModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports.addMessage = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: false, 
        msg: "Access token required" 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const senderId = decoded.userId;
    
    const { to, message } = req.body;
    const imageFile = req.file;
    
    if (!to) {
      return res.status(400).json({
        status: false,
        msg: "Recipient ID is required"
      });
    }
    
    if (!message && !imageFile) {
      return res.status(400).json({
        status: false,
        msg: "Message text or image is required"
      });
    }
    
    let messageData = {
      users: [senderId, to],
      sender: senderId,
    };
    
    // Determine message type and content
    if (imageFile && message) {
      messageData.message = {
        text: message,
        image: `/uploads/${imageFile.filename}`,
        type: 'mixed'
      };
    } else if (imageFile) {
      messageData.message = {
        image: `/uploads/${imageFile.filename}`,
        type: 'image'
      };
    } else {
      messageData.message = {
        text: message,
        type: 'text'
      };
    }
    
    const newMessage = await Message.create(messageData);
    
    if (newMessage) {
      return res.json({
        status: true,
        msg: "Message added successfully",
        message: {
          _id: newMessage._id,
          message: newMessage.message,
          sender: newMessage.sender,
          time: newMessage.time
        }
      });
    } else {
      return res.json({
        status: false,
        msg: "Failed to add message to the database"
      });
    }
  } catch (ex) {
    if (ex.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: false, 
        msg: "Invalid token" 
      });
    }
    next(ex);
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: false, 
        msg: "Access token required" 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUserId = decoded.userId;
    
    const { from } = req.body;
    
    if (!from) {
      return res.status(400).json({
        status: false,
        msg: "Recipient ID is required"
      });
    }
    
    const messages = await Message.find({
      users: {
        $all: [currentUserId, from],
      },
    }).sort({ updatedAt: 1 });
    
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === currentUserId,
        message: msg.message,
        time: msg.time,
        _id: msg._id
      };
    });
    
    return res.json({
      status: true,
      messages: projectedMessages,
      count: projectedMessages.length
    });
  } catch (ex) {
    if (ex.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: false, 
        msg: "Invalid token" 
      });
    }
    next(ex);
  }
};

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: false, 
        msg: "Access token required" 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUserId = decoded.userId;
    
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        status: false,
        msg: "Message not found"
      });
    }
    
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({
        status: false,
        msg: "You can only delete your own messages"
      });
    }
    
    // Delete associated image file if exists
    if (message.message.image) {
      const imagePath = path.join(__dirname, '..', message.message.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Message.findByIdAndDelete(messageId);
    
    return res.json({
      status: true,
      msg: "Message deleted successfully"
    });
  } catch (ex) {
    if (ex.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: false, 
        msg: "Invalid token" 
      });
    }
    next(ex);
  }
};

module.exports.getConversations = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: false, 
        msg: "Access token required" 
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUserId = decoded.userId;
    
    const conversations = await Message.aggregate([
      {
        $match: {
          users: { $in: [currentUserId] }
        }
      },
      {
        $sort: { time: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$users.0", currentUserId] },
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
    
    return res.json({
      status: true,
      conversations,
      count: conversations.length
    });
  } catch (ex) {
    if (ex.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: false, 
        msg: "Invalid token" 
      });
    }
    next(ex);
  }
};

// Export upload middleware for use in routes
module.exports.upload = upload;
