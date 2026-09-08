const mongoose = require('mongoose');
module.exports = mongoose.model('History', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['destination', 'package', 'search', 'flight'], required: true },
  title: { type: String, required: true, maxlength: 200 },
  details: { type: String, maxlength: 1000, default: '' },
  destinationId: { type: String, default: '' },
}, { timestamps: true }));
