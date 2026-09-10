const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت تنظیمات' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const fields = [
      'siteName','tabTitle','backgroundEffect','tubesConfig','heroConfig',
      'instagram','youtube','pond5',
      'aboutTitle','aboutText','feature1Title','feature1Text','feature2Title','feature2Text',
      'heroBadgeText','heroTitle','heroTitleAccent','heroSubtitle',
      'heroPrimaryBtnText','heroPrimaryBtnLink','heroSecondaryBtnText','heroSecondaryBtnLink',
      'gallerySectionId','galleryTitle','gallerySubtitle',
      'footerCopyright','footerContactEmail','footerContactPhone'
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    }

    if (req.body.navLinks !== undefined) {
      try {
        settings.navLinks = JSON.parse(req.body.navLinks);
      } catch (e) {
        console.error('Error parsing navLinks');
      }
    }

    const logoFile = req.files?.logoFile?.[0];
    const faviconFile = req.files?.faviconFile?.[0];
    if (logoFile) settings.logoUrl = '/previews/' + logoFile.filename;
    if (faviconFile) settings.faviconUrl = '/previews/' + faviconFile.filename;

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطا در بروزرسانی تنظیمات' });
  }
};