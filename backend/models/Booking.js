const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientInitials: { type: String, default: 'JD' },
  destination: { type: String, required: true }, // e.g., "Colombo, Sri Lanka"
  dates: { type: String, required: true },       // e.g., "Nov 12 - Nov 20"
  status: { 
    type: String, 
    enum: ['Confirmed', 'Pending Payment', 'Action Required', 'Cancelled'], 
    default: 'Confirmed' 
  },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
