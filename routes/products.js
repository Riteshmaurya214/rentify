const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let useCloudinary = false;
let cloudinary = null;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    useCloudinary = true;
  } catch (err) {
    console.warn('Cloudinary config failed, falling back to local uploads.');
    useCloudinary = false;
  }
}

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/add', protect, (req,res) => res.render('addProduct'));

router.post('/add', protect, upload.array('images', 5), async (req,res) => {
  try {
    const { title, description, category, pricePerDay, videoUrl, location, minRentDays, maxRentDays, securityDeposit } = req.body;
    let images = [];

    if(useCloudinary && req.files && req.files.length){
      for(const file of req.files){
        const r = await cloudinary.uploader.upload(path.join(uploadDir, file.filename), { folder: 'rentify' });
        images.push(r.secure_url);
        try { fs.unlinkSync(path.join(uploadDir, file.filename)); } catch(e){}
      }
    } else {
      images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    }

    const product = new Product({
      owner: req.user._id,
      title, description, category, images, videoUrl, location,
      minRentDays: parseInt(minRentDays) || 1,
      maxRentDays: parseInt(maxRentDays) || 30,
      securityDeposit: parseFloat(securityDeposit) || 0,
      pricePerDay: parseFloat(pricePerDay) || 0
    });
    await product.save();
    req.flash('success_msg','Product added');
    res.redirect('/dashboard');
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/products/add');
  }
});

router.get('/:id', async (req,res) => {
  try {
    const product = await Product.findById(req.params.id).populate('owner', 'name email notifications');
    if(!product) {
      req.flash('error_msg','Product not found');
      return res.redirect('/');
    }
    res.render('product', { product });
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/');
  }
});

module.exports = router;

// delete product (owner-only)
router.post('/:id/delete', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(!product) {
      req.flash('error_msg','Product not found');
      return res.redirect('/dashboard');
    }
    if(String(product.owner) !== String(req.user._id)){
      req.flash('error_msg','Not authorized');
      return res.redirect('/dashboard');
    }
    await Product.deleteOne({ _id: product._id });
    req.flash('success_msg','Product deleted');
    res.redirect('/dashboard');
  } catch(err){
    console.error(err);
    req.flash('error_msg','Server error');
    res.redirect('/dashboard');
  }
});

module.exports = router;
