const router = require('express').Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const attempts = new Map();
router.use((req, res, next) => {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.reset <= now) attempts.delete(key);
  const key = req.ip;
  const entry = attempts.get(key) || { count: 0, reset: now + 600000 };
  entry.count += 1;
  attempts.set(key, entry);
  if (entry.count > 100) return res.status(429).json({ message: 'Too many sign-in attempts. Try again later.' });
  next();
});
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, (req, res) => res.json({ _id: req.user.id, fullName: req.user.fullName, email: req.user.email, role: req.user.role }));
router.use('/oauth', require('./oauthRoutes'));
module.exports = router;
