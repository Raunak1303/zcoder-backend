// models/Room.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Optional field for storing recent messages for history loading
  messages: [MessageSchema],
  
  // Optional for real-time code sharing session
  currentCode: {
    type: String,
    default: ''
  },

  // Optional room settings (example: is the room public or private)
  isPublic: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Room', RoomSchema);
