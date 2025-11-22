require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const attachUser = require('./middleware/attachUser');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/rentify');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use(attachUser);

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// ⬇️ ADD THIS HERE
app.use(async (req, res, next) => {
  try {
    res.locals.query = req.query || {};
    const Product = require('./models/Product');
    res.locals.categories = await Product.distinct('category');
    res.locals.locations = await Product.distinct('location');
  } catch {
    res.locals.categories = [];
    res.locals.locations = [];
  }
  next();
});

// routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/rentals', require('./routes/rentals'));
app.use('/admin', require('./routes/admin'));
app.use('/notifications', require('./routes/notifications'));

// small payments placeholder route
app.post('/pay/simulate', (req, res) => {
  req.flash('success_msg', 'Payment simulated successfully (placeholder).');
  res.redirect('/dashboard');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
