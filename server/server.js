const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ایمپورت مدل و کتابخانه‌های مورد نیاز برای ساخت ادمین
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

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

// ساخت پوشه previews در صورت عدم وجود (برای جلوگیری از ارور آپلود)
const previewsDir = path.join(__dirname, 'uploads', 'previews');
const originalsDir = path.join(__dirname, 'uploads', 'originals');
for (const directory of [previewsDir, originalsDir]) fs.mkdirSync(directory, { recursive: true });

// دسترسی عمومی به پوشه previews و آپلودها برای نمایش در فرانت‌اند
app.use('/previews', express.static(previewsDir, { index: false, maxAge: '7d' }));

// ==========================================
// اتصال به دیتابیس MongoDB (پشتیبانی از هاست و لوکال)
// ==========================================
// آدرس دیتابیس را از محیط هاست می‌خواند، اگر نبود به لوکال شما وصل می‌شود
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediastore';

mongoose.connect(mongoURI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// مسیرها (Routes)
// ==========================================
const mediaRoutes = require('./routes/mediaRoutes');
const messageRoutes = require('./routes/messageRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// اتصال مسیرها به سرور
app.use('/wp-json/studio/v1/media', mediaRoutes);
app.use('/wp-json/studio/v1/messages', messageRoutes);
app.use('/wp-json/studio/v1/settings', settingsRoutes);
app.use('/wp-json/studio/v1/auth', authRoutes);
app.use('/wp-json/studio/v1/users', userRoutes);
app.use('/wp-json/studio/v1/payment', paymentRoutes);

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
      // اگر ادمین اصلا وجود نداشت آن را بساز
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
      // اگر وجود داشت ولی نقصی در فیلدها بود، آن را بروزرسانی کن
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

// اجرای تابع پس از اتصال به دیتابیس
createDefaultAdmin();

// ==========================================
      
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

// اجرای تابع پس از اتصال به دیتابیس
createDefaultAdmin();

// ==========================================
// 🌟 تنظیمات فرانت‌اند (React) برای هاست سی‌پنل 🌟
// ==========================================
// به سرور می‌گوییم که پوشه dist (سایت شما) را شناسایی و بارگذاری کند
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist, { index: false }));

// اگر کاربری آدرسی را زد که مربوط به API نبود، صفحه اصلی سایت باز شود (مخصوص React Router)
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
