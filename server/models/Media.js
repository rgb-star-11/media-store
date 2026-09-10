const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mediaType: { type: String, required: true }, // 'image' یا 'video'
  tags: { type: [String], default: [] },
  previewUrl: { type: String, required: true },
  originalFileName: { type: String, required: true },
  metadata: {
    resolution: { type: String, default: 'Original' },
    aspectRatio: { type: String, default: '16:9' },
    pond5StoreLink: { type: String, default: '' },
    cameraModel: { type: String, default: '' },
    location: { type: String, default: '' }
  },
  price: {
    irr: { type: Number, default: 0 },
    usd: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);