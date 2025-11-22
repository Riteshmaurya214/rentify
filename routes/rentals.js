const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.post('/request/:productId', protect, async (req,res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if(!product) {
      req.flash('error_msg','Product not found');
      return res.redirect('/');
    }

    const { startDate, endDate, message } = req.body;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.max(1, Math.ceil((e - s) / (1000*60*60*24)) + 1);
    if(days < product.minRentDays || days > product.maxRentDays){
      req.flash('error_msg', `Please select days between ${product.minRentDays} and ${product.maxRentDays}`);
      return res.redirect('/products/' + product._id);
    }
    const totalPrice = days * product.pricePerDay;

    const rental = new Rental({
      product: product._id,
      renter: req.user._id,
      owner: product.owner,
      startDate, endDate, totalPrice,
      status: 'requested'
    });
    await rental.save();

    // create a notification for the owner
    try {
      const owner = await User.findById(product.owner);
      if(owner){
        owner.notifications = owner.notifications || [];
        owner.notifications.unshift({
          message: `${req.user.name} requested to rent your item "${product.title}" from ${s.toDateString()} to ${e.toDateString()}.`
        });
        await owner.save();
      }
    } catch(e){
      console.error('Notification error', e);
    }

    req.flash('success_msg','Rent request sent. Owner will be notified.');
    res.redirect('/dashboard');
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/');
  }
});

router.post('/:id/decide', protect, async (req,res) => {
  try {
    const { action } = req.body;
    const rental = await Rental.findById(req.params.id);
    if(!rental) return res.redirect('/dashboard');
    if(String(rental.owner) !== String(req.user._id)) {
      req.flash('error_msg','Not authorized');
      return res.redirect('/dashboard');
    }
    rental.status = action === 'approve' ? 'approved' : 'declined';
    await rental.save();
    req.flash('success_msg', `Request ${rental.status}`);
    res.redirect('/dashboard');
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/dashboard');
  }
});

module.exports = router;
