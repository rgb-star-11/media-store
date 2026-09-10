const mongoose = require('mongoose');

const navLinkSchema = new mongoose.Schema({
  title: String,
  path: String
});

const settingsSchema = new mongoose.Schema({
  // --- عمومی ---
  siteName:   { type: String, default: 'استودیو من' },
  logoUrl:    { type: String, default: '' },
  tabTitle:   { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  instagram:  { type: String, default: '' },
  youtube:    { type: String, default: '' },
  pond5:      { type: String, default: '' },
  navLinks:   [navLinkSchema],
  backgroundEffect: { type: String, default: 'rays-hero' },
  tubesConfig: { type: String, default: '' },
  heroConfig: { type: String, default: '' },

  // --- بخش هیرو ---
  heroBadgeText:        { type: String, default: 'بانک تصویری حرفه‌ای' },
  heroTitle:            { type: String, default: 'تصاویر خلاقانه' },
  heroTitleAccent:      { type: String, default: 'برای پروژه‌های حرفه‌ای شما' },
  heroSubtitle:         { type: String, default: 'مجموعه‌ای از تصاویر و ویدیوهای باکیفیت برای استفاده تجاری و شخصی' },
  heroPrimaryBtnText:   { type: String, default: 'مشاهده گالری' },
  heroPrimaryBtnLink:   { type: String, default: '#gallery' },
  heroSecondaryBtnText: { type: String, default: 'درباره ما' },
  heroSecondaryBtnLink: { type: String, default: '#about' },

  // --- بخش گالری ---
  gallerySectionId: { type: String, default: 'gallery' },
  galleryTitle:     { type: String, default: 'گالری آثار' },
  gallerySubtitle:  { type: String, default: 'مجموعه تصاویر و ویدیوهای منتخب' },

  // --- بخش درباره ما ---
  aboutTitle:    { type: String, default: '' },
  aboutText:     { type: String, default: '' },
  feature1Title: { type: String, default: '' },
  feature1Text:  { type: String, default: '' },
  feature2Title: { type: String, default: '' },
  feature2Text:  { type: String, default: '' },

  // --- فوتر ---
  footerCopyright:    { type: String, default: '' },
  footerContactEmail: { type: String, default: '' },
  footerContactPhone: { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);