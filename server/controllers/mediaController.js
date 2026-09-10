const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Media = require('../models/Media');

const parseTags = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(t => String(t).trim().replace(/^#/, '')).filter(Boolean);
  return String(input).split(/[\s,،#]+/).map(t => t.trim().replace(/^#/, '')).filter(Boolean);
};

exports.uploadMedia = async (req, res) => {
  try {
    const { title, description, mediaType, priceIrr, pond5Link, pond5Preview, tags, cameraModel, location } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'فایل اصلی انتخاب نشده است' });
    }
    if (!['image', 'video'].includes(mediaType) || !file.mimetype.startsWith(`${mediaType}/`)) {
      fs.unlink(file.path, () => {});
      return res.status(400).json({ error: 'نوع اثر و فایل با هم مطابقت ندارند.' });
    }

    let previewUrlPath = '';
    let metadata = { 
      resolution: 'Original', 
      aspectRatio: '16:9', 
      pond5StoreLink: pond5Link || '',
      cameraModel: cameraModel || '',
      location: location || ''
    };

    if (mediaType === 'image') {
      const previewFileName = `preview-${Date.now()}.webp`;
      const previewPath = path.join(__dirname, '../uploads/previews', previewFileName);

      try {
        const image = sharp(file.path);
        const imageInfo = await image.metadata();
        metadata.resolution = `${imageInfo.width || 0}x${imageInfo.height || 0}`;
        if (imageInfo.width && imageInfo.height) {
          metadata.aspectRatio = `${(imageInfo.width / imageInfo.height).toFixed(2)}:1`;
        }

        const watermarkSvg = Buffer.from(`
          <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <style>.txt { fill: rgba(255, 255, 255, 0.4); font-size: 48px; font-weight: bold; font-family: Arial, sans-serif; }</style>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="txt" transform="rotate(-30 400 300)">PREVIEW ONLY</text>
          </svg>
        `);

        await sharp(file.path)
          .resize({ width: 1400, withoutEnlargement: true })
          .composite([{ input: watermarkSvg, blend: 'over', gravity: 'center' }])
          .webp({ quality: 80 })
          .toFile(previewPath);
        
        previewUrlPath = `/previews/${previewFileName}`;
      } catch (sharpErr) {
        return res.status(400).json({ error: 'فایل تصویر قابل پردازش نیست.' });
      }
    } else if (mediaType === 'video') {
      if (!pond5Link || !pond5Preview) {
        return res.status(400).json({ error: 'لینک فروشگاه و پیش‌نمایش Pond5 الزامی است' });
      }

      const ext = path.extname(new URL(pond5Preview).pathname) || '.mp4';
      const previewFileName = `preview-${Date.now()}${ext}`;
      const previewPath = path.join(__dirname, '../uploads/previews', previewFileName);

      try {
        const response = await axios({ method: 'GET', url: pond5Preview, responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
        const writer = fs.createWriteStream(previewPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        previewUrlPath = `/previews/${previewFileName}`;
        metadata.resolution = '4K UHD / Hosted Locally';
      } catch (err) {
        return res.status(500).json({ error: 'خطا در دانلود ویدیوی پیش‌نمایش از Pond5.' });
      }
    }

    const newMedia = new Media({
      title: title || 'بدون عنوان',
      description: description || '',
      mediaType: mediaType || 'image',
      tags: parseTags(tags),
      previewUrl: previewUrlPath,
      originalFileName: file.filename,
      metadata,
      price: { irr: Number(priceIrr) || 0, usd: 0 }
    });

    await newMedia.save();
    return res.status(201).json({ message: 'اثر ذخیره شد', data: newMedia });
  } catch (error) {
    return res.status(500).json({ error: 'خطا در بارگذاری اثر' });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priceIrr, cameraModel, location, pond5Link, tags } = req.body;
    
    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ error: 'اثر یافت نشد' });

    if (title) media.title = title;
    if (priceIrr !== undefined) media.price.irr = Number(priceIrr);
    if (cameraModel !== undefined) media.metadata.cameraModel = cameraModel;
    if (location !== undefined) media.metadata.location = location;
    if (pond5Link !== undefined) media.metadata.pond5StoreLink = pond5Link;
    if (tags !== undefined) media.tags = parseTags(tags);

    await media.save();
    res.json({ message: 'تغییرات با موفقیت ذخیره شد', data: media });
  } catch (error) {
    res.status(500).json({ error: 'خطا در ذخیره تغییرات' });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const items = await Media.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'خطا' });
  }
};

exports.getOriginalMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);
    if (!media) return res.status(404).send('فایل یافت نشد');
    const filePath = path.join(__dirname, '../uploads/originals', media.originalFileName);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).send('یافت نشد');
  } catch (err) {
    res.status(500).send('خطا');
  }
};

exports.getHeroMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);
    if (!media || media.mediaType !== 'image') return res.status(404).send('یافت نشد');
    const filePath = path.join(__dirname, '../uploads/originals', media.originalFileName);
    if (!fs.existsSync(filePath)) return res.status(404).send('فایل یافت نشد');

    // Crystal-clear full-resolution WebP without quality degradation or downscaling
    const buffer = await sharp(filePath)
      .webp({ quality: 98, effort: 6 })
      .toBuffer();

    res.set('Content-Type', 'image/webp');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('خطا');
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ error: 'یافت نشد' });

    const originalFilePath = path.join(__dirname, '../uploads/originals', media.originalFileName);
    if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);

    const previewFilePath = path.join(__dirname, '../uploads/previews', path.basename(media.previewUrl));
    if (fs.existsSync(previewFilePath)) fs.unlinkSync(previewFilePath);

    await Media.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'خطا در حذف' });
  }
};
