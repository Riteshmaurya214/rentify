const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  status: { type: String, enum: ['requested','approved','declined','ongoing','completed'], default: 'requested' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rental', RentalSchema);
