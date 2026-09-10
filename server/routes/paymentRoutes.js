const express = require('express');
const router = express.Router();
const { createCheckout, downloadOriginal } = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

// مسیر ثبت سفارش و تولید لینک دانلود
router.post('/checkout', requireAuth, createCheckout);

// مسیر دانلود فایل با توکن زمان‌دار
router.get('/download/:token', downloadOriginal);

module.exports = router;
