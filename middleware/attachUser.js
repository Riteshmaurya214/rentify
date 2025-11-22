const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    let token = req.cookies && req.cookies.token;
    if(!token) {
      res.locals.user = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id).select('-password');
    if(user) {
      req.user = user;
      res.locals.user = user;
    } else {
      res.locals.user = null;
    }
    return next();
  } catch (err) {
    res.locals.user = null;
    return next();
  }
};
