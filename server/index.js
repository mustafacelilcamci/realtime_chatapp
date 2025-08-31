const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const { requestLogger, errorHandler, rateLimiter } = require("./middleware/authMiddleware");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp Clone API",
      version: "2.0.0",
      description: "Comprehensive API documentation for WhatsApp Clone application with JWT authentication and image support",
      contact: {
        name: "API Support",
        email: "support@whatsappclone.com"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server"
      },
      {
        url: "https://api.whatsappclone.com",
        description: "Production server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
              example: "507f1f77bcf86cd799439011"
            },
            username: {
              type: "string",
              description: "Username",
              example: "john_doe"
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
              example: "john@example.com"
            },
            avatarImage: {
              type: "string",
              description: "Avatar image URL",
              example: "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
            },
            isAvatarImageSet: {
              type: "boolean",
              description: "Whether avatar is set",
              example: true
            }
          },
          required: ["_id", "username", "email"]
        },
        Message: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Message ID",
              example: "507f1f77bcf86cd799439012"
            },
            message: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                  description: "Message text content",
                  example: "Hello! How are you?"
                },
                image: {
                  type: "string",
                  description: "Image file path",
                  example: "/uploads/image-1234567890.jpg"
                },
                type: {
                  type: "string",
                  enum: ["text", "image", "mixed"],
                  description: "Message type",
                  example: "mixed"
                }
              }
            },
            users: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Array of user IDs in conversation",
              example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"]
            },
            sender: {
              type: "string",
              description: "Sender user ID",
              example: "507f1f77bcf86cd799439011"
            },
            time: {
              type: "string",
              format: "date-time",
              description: "Message timestamp",
              example: "2024-01-15T10:30:00.000Z"
            }
          },
          required: ["_id", "message", "sender"]
        },
        Conversation: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Other user's ID in conversation",
              example: "507f1f77bcf86cd799439013"
            },
            lastMessage: {
              type: "string",
              description: "Last message in conversation (with emoji for images)",
              example: "Hello! 📷"
            },
            lastMessageTime: {
              type: "string",
              format: "date-time",
              description: "Timestamp of last message",
              example: "2024-01-15T10:30:00.000Z"
            },
            messageCount: {
              type: "integer",
              description: "Total number of messages in conversation",
              example: 25
            }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              description: "Username",
              example: "john_doe"
            },
            password: {
              type: "string",
              description: "Password",
              example: "password123"
            }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              description: "Username",
              example: "john_doe"
            },
            email: {
              type: "string",
              format: "email",
              description: "Email address",
              example: "john@example.com"
            },
            password: {
              type: "string",
              description: "Password (min 8 characters)",
              example: "password123"
            }
          }
        },
        MessageRequest: {
          type: "object",
          required: ["to"],
          properties: {
            to: {
              type: "string",
              description: "Recipient user ID",
              example: "507f1f77bcf86cd799439013"
            },
            message: {
              type: "string",
              description: "Message text (optional if image is provided)",
              example: "Check out this photo!"
            },
            image: {
              type: "string",
              format: "binary",
              description: "Image file (optional if message text is provided)"
            }
          }
        },
        ProfileUpdateRequest: {
          type: "object",
          properties: {
            username: {
              type: "string",
              description: "New username",
              example: "new_username"
            },
            email: {
              type: "string",
              format: "email",
              description: "New email address",
              example: "newemail@example.com"
            }
          }
        },
        PasswordChangeRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
              description: "Current password",
              example: "oldpassword123"
            },
            newPassword: {
              type: "string",
              description: "New password (min 8 characters)",
              example: "newpassword123"
            }
          }
        },
        ApiResponse: {
          type: "object",
          properties: {
            status: {
              type: "boolean",
              description: "Request status",
              example: true
            },
            msg: {
              type: "string",
              description: "Response message",
              example: "Operation completed successfully"
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "boolean",
              description: "Request status",
              example: false
            },
            msg: {
              type: "string",
              description: "Error message",
              example: "Invalid credentials"
            }
          }
        }
      }
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication endpoints"
      },
      {
        name: "User Management",
        description: "User profile and account management endpoints"
      },
      {
        name: "Messages",
        description: "Message and conversation management endpoints with image support"
      }
    ]
  },
  apis: ["./routes/*.js", "./controllers/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "WhatsApp Clone API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
