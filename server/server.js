const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ==========================================
// بررسی کلیدهای امنیتی برنامه
// ==========================================
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and be at least 32 characters long.');
}

// ==========================================
// تنظیمات پایه و میدلورها (Middlewares)
// ==========================================
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  next();
});

const rawOrigins = process.env.CLIENT_ORIGIN || '*';
const allowedOrigins = rawOrigins.split(',').map((v) => v.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProduction || rawOrigins === '*') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ساخت پوشه‌های آپلود در صورت عدم وجود
const originalsDir = path.join(__dirname, 'uploads/originals');
const previewsDir = path.join(__dirname, 'uploads/previews');
if (!fs.existsSync(originalsDir)) fs.mkdirSync(originalsDir, { recursive: true });
if (!fs.existsSync(previewsDir)) fs.mkdirSync(previewsDir, { recursive: true });

app.use('/previews', express.static(previewsDir));

// ==========================================
// اتصال به دیتابیس MongoDB
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediastore';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// مسیرهای اصلی API (Routes)
// ==========================================
app.use('/wp-json/studio/v1/auth', require('./routes/authRoutes'));
app.use('/wp-json/studio/v1/user', require('./routes/userRoutes'));
app.use('/wp-json/studio/v1/media', require('./routes/mediaRoutes'));
app.use('/wp-json/studio/v1/settings', require('./routes/settingsRoutes'));
app.use('/wp-json/studio/v1/messages', require('./routes/messageRoutes'));
app.use('/wp-json/studio/v1/payment', require('./routes/paymentRoutes'));

// ==========================================
// کد ساخت اتوماتیک اکانت مدیر سایت (Admin Seed)
// ==========================================
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPass = process.env.INITIAL_ADMIN_PASSWORD;
    const adminMobile = process.env.INITIAL_ADMIN_MOBILE;
    if (!adminEmail || !adminPass || !adminMobile) return;
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPass, salt);
      
      await User.create({
        firstName: 'مدیریت',
        lastName: 'استودیو',
        mobile: adminMobile,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ اکانت مدیر اولیه ساخته شد.');
    } else {
      let updated = false;
      if (existingAdmin.role !== 'admin') { existingAdmin.role = 'admin'; updated = true; }
      if (!existingAdmin.firstName) { existingAdmin.firstName = 'مدیریت'; updated = true; }
      if (!existingAdmin.lastName) { existingAdmin.lastName = 'استودیو'; updated = true; }
      if (!existingAdmin.mobile) { existingAdmin.mobile = adminMobile; updated = true; }
      
      if (updated) {
        await existingAdmin.save();
        console.log('✅ اکانت ادمین بروزرسانی و تایید شد.');
      } else {
        console.log('✅ اکانت ادمین از قبل وجود دارد و دسترسی کامل برقرار است.');
      }
    }
  } catch (error) { 
    console.error('❌ خطا در بررسی/ساخت اکانت ادمین:', error); 
  }
};

createDefaultAdmin();

// ==========================================
// 🌟 تنظیمات فرانت‌اند (React) 🌟
// ==========================================
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist, { index: false }));

app.get(/.*/, (req, res) => {
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.json({ status: 'Studio API Server is Online', version: '1.0.0' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) return res.status(400).json({ error: 'درخواست نامعتبر است.' });
  console.error(err);
  return res.status(500).json({ error: 'خطای داخلی سرور' });
});

// ==========================================
// روشن کردن سرور
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
