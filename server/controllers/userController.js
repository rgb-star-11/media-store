const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: 'خطا در دریافت کاربران' }); }
};

exports.changeUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'رمز عبور حداقل ۶ کاراکتر باشد' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.json({ success: true, message: 'رمز تغییر کرد' });
  } catch (err) { res.status(500).json({ error: 'خطا در تغییر رمز' }); }
};

// --- تابع جدید: حذف کاربر ---
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'کاربر یافت نشد' });
    if (user.role === 'admin') return res.status(403).json({ error: 'مدیر کل قابل حذف نیست!' });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'کاربر با موفقیت حذف شد' });
  } catch (err) { res.status(500).json({ error: 'خطا در حذف کاربر' }); }
};