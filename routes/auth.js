const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.get('/register', (req,res) => res.render('register'));

router.post('/register', async (req,res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if(user){
      req.flash('error_msg','Email already registered');
      return res.redirect('/auth/register');
    }
    user = new User({ name, email, password, role: role || 'renter' });
    await user.save();
    req.flash('success_msg','Registration successful. Please login.');
    res.redirect('/auth/login');
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/auth/register');
  }
});

router.get('/login', (req,res) => res.render('login'));

router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user) {
      req.flash('error_msg','Invalid credentials');
      return res.redirect('/auth/login');
    }
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
      req.flash('error_msg','Invalid credentials');
      return res.redirect('/auth/login');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req,res) => {
  res.clearCookie('token');
  req.flash('success_msg','Logged out');
  res.redirect('/');
});

module.exports = router;
