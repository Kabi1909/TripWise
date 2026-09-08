const mongoose = require('mongoose');
module.exports = mongoose.model('OAuthAttempt', new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  provider: String, nonce: String, verifier: String, challenge: String, role: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, required: true, expires: 0 },
}));
