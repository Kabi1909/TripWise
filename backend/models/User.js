const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  oauthProvider: { type: String, enum: ['google', 'apple'] },
  oauthSubject: { type: String },
  role: { 
    type: String, 
    enum: ['Traveler', 'Travel Agent'], 
    default: 'Traveler' 
  },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
