const mongoose = require('mongoose');
module.exports = mongoose.model('Message', new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  senderName: { type: String, required: true },
  senderInitials: String,
  message: { type: String, required: true, maxlength: 4000 },
  unread: { type: Boolean, default: true },
}, { timestamps: true }));
