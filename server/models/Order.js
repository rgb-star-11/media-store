const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  currency: { type: String, enum: ['IRR', 'USD'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  customerEmail: { type: String },
  gateway: { type: String, default: 'manual_or_zarinpal' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);