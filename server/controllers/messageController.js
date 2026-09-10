const Message = require('../models/Message');

// دریافت پیام از سمت کاربر (سایت)
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'لطفاً تمام فیلدها را پر کنید' });
    }
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: 'پیام شما با موفقیت ارسال شد' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ارسال پیام' });
  }
};

// مشاهده لیست پیام‌ها توسط ادمین
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت پیام‌ها' });
  }
};

// خوانده شده کردن پیام
exports.markAsRead = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (msg) {
      msg.isRead = true;
      await msg.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'خطا' });
  }
};

// حذف پیام
exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'خطا در حذف' });
  }
};