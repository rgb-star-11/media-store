const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { rateLimit } = require('../middleware/rateLimit');

const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'تلاش‌های ورود بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید.' });
const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'درخواست کد بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید.' });

// بررسی و ورود با شماره موبایل
router.post('/check-mobile', loginLimit, authController.checkMobile);
router.post('/login-mobile-password', loginLimit, authController.loginWithMobilePassword);

// ثبت‌نام و ورود مستقیم با ایمیل
router.post('/register', loginLimit, authController.register);
router.post('/login', loginLimit, authController.login);

// فراموشی و بازنشانی رمز عبور با ایمیل
router.post('/forgot-password', loginLimit, authController.forgotPassword);
router.post('/reset-password', loginLimit, authController.resetPassword);

// سیستم کد پیامکی OTP (ارسال و تایید بار اول)
router.post('/send-otp', otpLimit, authController.sendOtp);
router.post('/verify-otp', loginLimit, authController.verifyOtp);

module.exports = router;
