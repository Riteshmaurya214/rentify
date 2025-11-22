const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  images: [String],
  videoUrl: String,
  location: String,
  minRentDays: { type: Number, default: 1 },
  maxRentDays: { type: Number, default: 30 },
  securityDeposit: { type: Number, default: 0 },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
