const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // این خط باعث می‌شود کد به صورت خودکار بعد از ۱۲۰ ثانیه از دیتابیس منقضی و حذف شود
    expires: 120 
  }
});

module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);