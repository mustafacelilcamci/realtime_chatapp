const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    message: {
      text: {
        type: String,
        required: false,
      },
      image: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        enum: ['text', 'image', 'mixed'],
        default: 'text',
        required: true
      }
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", messageSchema);
