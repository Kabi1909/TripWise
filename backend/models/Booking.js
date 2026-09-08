const mongoose = require('mongoose');
const activity = new mongoose.Schema({
  day: { type: Number, min: 1, required: true },
  time: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 2000, default: '' },
  status: { type: String, enum: ['past', 'active', 'future'], default: 'future' },
  menuUrl: { type: String, default: '' },
  reservation: { type: Boolean, default: false },
});
const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientInitials: String,
  travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  destination: { type: String, required: true },
  destinationId: { type: String, enum: ['colombo', 'mirissa-galle', 'sigiriya', 'ella'], required: true },
  packageName: { type: String, default: '' },
  dates: String,
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  groupSize: { type: Number, min: 1, max: 100, required: true },
  status: { type: String, enum: ['Confirmed', 'Pending Payment', 'Action Required', 'Cancelled'], default: 'Action Required' },
  amount: { type: Number, min: 0, default: 0 },
  paidAt: { type: Date, default: null },
  title: { type: String, required: true },
  highlightTitle: { type: String, default: '' },
  highlightDescription: { type: String, default: '' },
  schedule: [activity],
}, { timestamps: true });
module.exports = mongoose.model('Booking', bookingSchema);
