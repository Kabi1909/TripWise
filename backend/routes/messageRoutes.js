const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/messageController');
router.use(protect);
router.get('/notifications', c.getNotifications);
router.route('/').get(c.getMessages).post(c.sendMessage);
router.patch('/:id/read', c.readMessage);
module.exports = router;
