const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/messageController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// مسیر ارسال پیام (عمومی)
router.post('/send', sendMessage);

// مسیرهای ادمین (نیاز به توکن در حالت واقعی)
router.get('/', requireAuth, requireAdmin, getMessages);
router.put('/:id/read', requireAuth, requireAdmin, markAsRead);
router.delete('/:id', requireAuth, requireAdmin, deleteMessage);

module.exports = router;
