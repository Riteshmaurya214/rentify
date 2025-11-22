const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// mark all notifications as read
router.post('/mark-read', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).send('User not found');
    if(user.notifications && user.notifications.length){
      user.notifications = user.notifications.map(n => ({ ...n.toObject(), read: true }));
      await user.save();
    }
    res.json({ ok: true });
  } catch(err){
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

// get notifications (simple)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ notifications: user.notifications || [] });
  } catch(err){
    console.error(err);
    res.status(500).json({ notifications: [] });
  }
});

module.exports = router;
