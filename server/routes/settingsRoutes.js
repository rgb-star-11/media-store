const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// تنظیمات آپلود برای لوگو
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/previews'));
  },
  filename: (req, file, cb) => {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)) });

router.get('/', getSettings);
// مسیر آپدیت حالا توانایی دریافت یک فایل به نام logoFile را دارد
router.put('/', requireAuth, requireAdmin, upload.fields([
  { name: 'logoFile', maxCount: 1 },
  { name: 'faviconFile', maxCount: 1 }
]), updateSettings);

module.exports = router;
