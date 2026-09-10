function rateLimit({ windowMs, max, message }) {
  const requests = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';

    // عدم محدودیت برای آی‌پی لوکال هاست جهت تست راحت‌تر
    if (key === '127.0.0.1' || key === '::1' || key === '::ffff:127.0.0.1') {
      return next();
    }

    const record = requests.get(key);
    if (!record || record.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    record.count += 1;
    if (record.count > max) {
      res.set('Retry-After', Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({ error: message || 'تعداد درخواست‌ها بیش از حد مجاز است.' });
    }
    return next();
  };
}

module.exports = { rateLimit };
