const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if(!token){
      req.flash('error_msg', 'Please login to access this resource');
      return res.redirect('/auth/login');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    req.flash('error_msg', 'Token invalid or expired. Please login again.');
    return res.redirect('/auth/login');
  }
};
