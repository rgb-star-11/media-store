const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const Order = require('../models/Order');

// ایجاد سفارش و شبیه‌سازی پرداخت
exports.createCheckout = async (req, res) => {
  try {
    const { mediaId, currency } = req.body;
    if (!['IRR', 'USD'].includes(currency)) return res.status(400).json({ error: 'ارز نامعتبر است.' });
    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({ error: 'اثر مورد نظر یافت نشد' });
    }

    const price = currency === 'IRR' ? media.price.irr : media.price.usd;

    // درگاه واقعی هنوز متصل نیست؛ هرگز با یک درخواست کاربر سفارش را تکمیل نکنید.
    const order = new Order({
      mediaId: media._id,
      currency: currency || 'IRR',
      amount: price || 0,
      customerEmail: req.user.email || '',
      status: 'pending',
      gateway: 'unconfigured'
    });

    await order.save();

    return res.status(202).json({
      success: false,
      orderId: order._id,
      message: 'درگاه پرداخت هنوز پیکربندی نشده است؛ هیچ مبلغی کسر و فایلی تحویل نشده است.'
    });

  } catch (error) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ error: 'خطا در ثبت سفارش و تولید لینک پرداخت' });
  }
};

// دانلود امن فایل اصلی با بررسی توکن موقت
exports.downloadOriginal = async (req, res) => {
  try {
    const { token } = req.params;
    const secretKey = process.env.JWT_SECRET;

    // رمزگشایی و اعتبارسنجی توکن و تاریخ انقضا
    const decoded = jwt.verify(token, secretKey);
    const media = await Media.findById(decoded.mediaId);

    if (!media) {
      return res.status(404).send('اثر مورد نظر یافت نشد.');
    }

    const filePath = path.join(__dirname, '../uploads/originals', media.originalFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('فایل اصلی روی سرور پیدا نشد.');
    }

    // ارسال فایل اصلی برای دانلود در مرورگر کاربر
    const fileExtension = path.extname(media.originalFileName);
    const downloadFileName = `${media.title.replace(/[\/\\:*?"<>|]/g, '_')}${fileExtension}`;

    return res.download(filePath, downloadFileName);

  } catch (error) {
    console.error('Download Token Verification Failed:', error.message);
    return res.status(401).send('لینک دانلود نامعتبر است یا منقضی شده است.');
  }
};
