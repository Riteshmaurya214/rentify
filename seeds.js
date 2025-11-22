require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/rentify';
connectDB(MONGO).then(async () => {
  try {
    console.log('Seeding DB...');

    await User.deleteMany({});
    await Product.deleteMany({});

    // Dummy users
    const u1 = new User({ name: 'Ritesh', email: 'ritesh@rentify.test', password: 'ritesh123', role: 'user' });
    const u2 = new User({ name: 'Shivam', email: 'shivam@rentify.test', password: 'shivam123', role: 'user' });
    const u3 = new User({ name: 'Vihaan', email: 'vihaan@rentify.test', password: 'vihaan123', role: 'user' });
    const owner = new User({ name: 'Owner User', email: 'owner@rentify.test', password: 'password123', role: 'user' });
    const renter = new User({ name: 'Renter User', email: 'renter@rentify.test', password: 'password123', role: 'user' });

    await u1.save();
    await u2.save();
    await u3.save();
    await owner.save();
    await renter.save();

    const products = [
      { owner: owner._id, title: 'Canon DSLR 80D', description: 'Great for events', category: 'Electronics', images: [], videoUrl: '', location: 'Varanasi', minRentDays:1, maxRentDays:14, securityDeposit:2000, pricePerDay:800 },
      { owner: owner._id, title: 'Mountain Bike Pro', description: 'Trail ready bike', category: 'Sports', images: [], videoUrl: '', location: 'Varanasi', minRentDays:1, maxRentDays:7, securityDeposit:500, pricePerDay:300 },
      { owner: owner._id, title: 'Portable Projector', description: 'Projector for movies', category: 'Electronics', images: [], videoUrl: '', location: 'Lucknow', minRentDays:1, maxRentDays:10, securityDeposit:1500, pricePerDay:600 },
      { owner: owner._id, title: 'Camping Tent', description: '4-person tent', category: 'Outdoors', images: [], videoUrl: '', location: 'Rishikesh', minRentDays:2, maxRentDays:14, securityDeposit:800, pricePerDay:350 }
    ];

    for(const p of products){
      const prod = new Product(p);
      await prod.save();
    }

    console.log('Seeding complete. Users created: ritesh@rentify.test / shivam@rentify.test / vihaan@rentify.test (passwords: ritesh123 / shivam123 / vihaan123)');
    process.exit(0);
  } catch(e){
    console.error(e);
    process.exit(1);
  }
}).catch(err => { console.error('DB connect failed', err); });
