const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

const getSecret = () => process.env.JWT_SECRET || 'supersecretkey123';
const getSignupSecret = () => process.env.SIGNUP_TOKEN_SECRET || 'signupsecretkey123';
const mobilePattern = /^09\d{9}$/;

const issueToken = (user) => jwt.sign(
  { id: user._id, role: user.role, name: `${user.firstName} ${user.lastName}`, email: user.email, mobile: user.mobile },
  getSecret(),
  { expiresIn: '7d' }
);

// ۱. بررسی وجود شماره موبایل کاربر
exports.checkMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || '').trim();
    if (!mobilePattern.test(cleanMobile)) {
      return res.status(400).json({ error: 'شماره موبایل معتبر نیست (باید ۱۱ رقم و با ۰۹ شروع شود).' });
    }

    const user = await User.findOne({ mobile: cleanMobile });
    return res.json({ success: true, exists: !!user, mobile: cleanMobile });
  } catch (err) {
    return res.status(500).json({ error: 'خطا در بررسی شماره موبایل' });
  }
};

// ۲. ورود کاربر موجود با شماره موبایل و رمز عبور
exports.loginWithMobilePassword = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const cleanMobile = (mobile || '').trim();
    if (!mobilePattern.test(cleanMobile) || !password) {
      return res.status(400).json({ error: 'شماره موبایل یا رمز عبور وارد نشده است.' });
    }

    const user = await User.findOne({ mobile: cleanMobile });
    if (!user) return res.status(400).json({ error: 'کاربری با این شماره موبایل یافت نشد.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'رمز عبور وارد شده اشتباه است.' });

    const fullName = `${user.firstName} ${user.lastName}`;
    const token = issueToken(user);
    return res.json({ success: true, token, role: user.role, name: fullName });
  } catch (err) {
    return res.status(500).json({ error: 'خطا در ورود' });
  }
};

// ۳. ثبت‌نام کاربر جدید (پس از تایید پیامک)
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password, province, city, addressDetail, verificationToken } = req.body;
    const cleanMobile = (mobile || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!firstName?.trim() || !lastName?.trim() || !mobilePattern.test(cleanMobile) || !/^\S+@\S+\.\S+$/.test(cleanEmail) || !password || password.length < 8) {
      return res.status(400).json({ error: 'اطلاعات ثبت‌نام معتبر نیست؛ رمز عبور باید حداقل ۸ کاراکتر باشد.' });
    }

    try {
      const verified = jwt.verify(verificationToken, getSignupSecret());
      if (verified.purpose !== 'signup' || verified.mobile !== cleanMobile) throw new Error('invalid');
    } catch (_) {
      return res.status(401).json({ error: 'ابتدا شماره همراه را با کد تایید پیامکی، تأیید کنید.' });
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) return res.status(400).json({ error: 'این ایمیل قبلاً ثبت شده است.' });

    const existingMobile = await User.findOne({ mobile: cleanMobile });
    if (existingMobile) return res.status(400).json({ error: 'این شماره موبایل قبلاً ثبت شده است.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      password: hashedPassword,
      province: province || '',
      city: city || '',
      addressDetail: addressDetail || '',
      role: 'user'
    });
    await newUser.save();

    const fullName = `${newUser.firstName} ${newUser.lastName}`;
    const token = issueToken(newUser);

    res.status(201).json({ success: true, message: 'ثبت‌نام با موفقیت انجام شد.', token, role: newUser.role, name: fullName });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'خطا در ثبت نام' });
  }
};

// ۴. ورود کلاسیک با ایمیل و رمز عبور
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ error: 'اطلاعات ورود اشتباه است.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'اطلاعات ورود اشتباه است.' });

    const fullName = `${user.firstName} ${user.lastName}`;
    const token = issueToken(user);
    res.json({ success: true, token, role: user.role, name: fullName });
  } catch (err) { res.status(500).json({ error: 'خطا در ورود' }); }
};

// ۵. فراموشی رمز عبور و ارسال لینک به ایمیل ثبت‌شده
exports.forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || '').trim();
    if (!mobilePattern.test(cleanMobile)) {
      return res.status(400).json({ error: 'شماره موبایل معتبر نیست.' });
    }

    const user = await User.findOne({ mobile: cleanMobile });
    if (!user) {
      return res.status(404).json({ error: 'کاربری با این شماره موبایل یافت نشد.' });
    }

    if (!user.email) {
      return res.status(400).json({ error: 'برای این حساب کاربری ایمیلی ثبت نشده است.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // معتبر تا ۱ ساعت
    await user.save();

    const host = req.headers.host || 'localhost:5173';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const resetUrl = `${protocol}://127.0.0.1:5173/?resetToken=${resetToken}`;

    await sendPasswordResetEmail({ toEmail: user.email, mobile: user.mobile, resetUrl });

    res.json({
      success: true,
      message: `لینک بازنشانی رمز عبور به ایمیل (${user.email}) ارسال شد.`
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'خطا در ارسال لینک بازنشانی رمز عبور.' });
  }
};

// ۶. بازنشانی رمز عبور با توکن دریافتی از ایمیل
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'لینک بازنشانی رمز عبور معتبر نیست یا منقضی شده است.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در بازنشانی رمز عبور' });
  }
};

// ---------------------------------------------------------------
// سیستم کد پیامکی OTP (ارسال و تایید بار اول)
// ---------------------------------------------------------------

exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || '').trim();
    if (!mobilePattern.test(cleanMobile)) return res.status(400).json({ error: 'شماره موبایل معتبر نیست.' });

    if (!process.env.MELIPAYAMAK_OTP_KEY || !process.env.MELIPAYAMAK_BODY_ID) {
      return res.status(503).json({ error: 'سرویس پیامک پیکربندی نشده است.' });
    }

    const code = crypto.randomInt(0, 100000).toString().padStart(5, '0');

    await Otp.findOneAndUpdate(
      { mobile: cleanMobile },
      { code, createdAt: Date.now() },
      { upsert: true, returnDocument: 'after' }
    );

    const data = JSON.stringify({ bodyId: Number(process.env.MELIPAYAMAK_BODY_ID), to: cleanMobile, args: [code] });
    const apiPath = '/api/send/shared/' + process.env.MELIPAYAMAK_OTP_KEY;

    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'console.melipayamak.com',
        port: 443,
        path: apiPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const smsReq = https.request(options, (smsRes) => {
        let responseData = '';
        smsRes.on('data', (d) => { responseData += d; });
        smsRes.on('end', () => {
          console.log('Melipayamak response:', smsRes.statusCode, responseData);
          if (smsRes.statusCode < 200 || smsRes.statusCode >= 300) {
            reject(new Error('SMS provider error: ' + smsRes.statusCode));
          } else {
            resolve(responseData);
          }
        });
      });

      smsReq.on('error', (err) => {
        console.error('SMS request error:', err.message);
        reject(err);
      });

      smsReq.write(data);
      smsReq.end();
    });

    res.json({ success: true, message: 'کد تایید ارسال شد.' });
  } catch (err) {
    console.error('OTP Send Error:', err.message);
    res.status(500).json({ error: 'خطا در ارسال کد تایید. لطفاً دوباره تلاش کنید.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, code } = req.body;
    const cleanMobile = (mobile || '').trim();
    if (!mobilePattern.test(cleanMobile) || !/^\d{5}$/.test(code || '')) return res.status(400).json({ error: 'شماره موبایل یا کد تایید نامعتبر است.' });

    const otpRecord = await Otp.findOne({ mobile: cleanMobile, code: code.trim() });
    if (!otpRecord) {
      return res.status(400).json({ error: 'کد وارد شده اشتباه است یا منقضی شده.' });
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    return res.json({
      success: true,
      mobile: cleanMobile,
      verificationToken: jwt.sign({ mobile: cleanMobile, purpose: 'signup' }, getSignupSecret(), { expiresIn: '15m' }),
      message: 'کد تایید شد. لطفاً ایمیل و رمز عبور خود را تعیین کنید.'
    });
  } catch (err) {
    console.error('OTP Verify Error:', err);
    res.status(500).json({ error: 'خطا در اعتبارسنجی کد' });
  }
};