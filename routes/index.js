const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const { protect } = require('../middleware/authMiddleware');

// Home with search & filters
router.get('/', async (req,res) => {
  try {
    const { q, category, location, minPrice, maxPrice } = req.query;
    const filter = {};
    const and = [];

    if(category && category !== 'all'){
      and.push({ category: category });
    }
    if(minPrice){
      and.push({ pricePerDay: { $gte: Number(minPrice) } });
    }
    if(maxPrice){
      and.push({ pricePerDay: { $lte: Number(maxPrice) } });
    }
    if(q){
      const regex = { $regex: q, $options: 'i' };
      and.push({ $or: [{ title: regex }, { description: regex }, { location: regex }] });
    }
    if(location && location !== ''){
      and.push({ location: { $regex: location, $options: 'i' } });
    }
    if(and.length) filter.$and = and;

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(50);
    // gather categories and locations for filters
    const categories = await Product.distinct('category');
    const locations = await Product.distinct('location');
    res.render('index', { products, categories, locations, query: req.query });
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/');
  }
});

router.get('/dashboard', protect, async (req,res) => {
  const myProducts = await Product.find({ owner: req.user._id });
  const myRequests = await Rental.find({ $or: [{ renter: req.user._id }, { owner: req.user._id }] }).populate('product');
  res.render('dashboard', { myProducts, myRequests });
});

module.exports = router;
