const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadMedia, updateMedia, getAllMedia, deleteMedia, getOriginalMedia, getHeroMedia } = require('../controllers/mediaController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/originals')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^(image|video)\//.test(file.mimetype);
    cb(allowed ? null : new Error('نوع فایل مجاز نیست.'), allowed);
  }
});

router.get('/', getAllMedia);
router.get('/raw/:id', requireAuth, requireAdmin, getOriginalMedia);
router.get('/hero/:id', getHeroMedia);
router.post('/upload', requireAuth, requireAdmin, upload.single('mediaFile'), uploadMedia);
router.put('/:id', requireAuth, requireAdmin, upload.none(), updateMedia);
router.delete('/:id', requireAuth, requireAdmin, deleteMedia);

module.exports = router;
