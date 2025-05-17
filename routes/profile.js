const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get profile
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Update profile
router.put('/', auth, async (req, res) => {
  const { username, bio } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { username, bio }, { new: true }).select('-password');
  res.json(user);
});

module.exports = router;
