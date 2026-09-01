const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderInitials: { type: String, default: 'CK' },
  avatar: { type: String, default: '' },
  message: { type: String, required: true },
  time: { type: String, default: '10:42 AM' },
  unread: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema); 
