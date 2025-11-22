const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  if(!(req.user && req.user.role === 'admin')) {
    req.flash('error_msg', 'Not authorized');
    return res.redirect('/');
  }
  const users = await User.find().limit(50);
  const products = await Product.find().limit(50).populate('owner','name email');
  res.render('admin', { users, products });
});

module.exports = router;
