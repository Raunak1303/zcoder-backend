const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for storing profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profilePictures');
    // Make sure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Use userId + timestamp + extension for uniqueness
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only jpg/jpeg/png
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Get profile (no change)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (username, bio)
router.put('/', auth, async (req, res) => {
  const { username, bio } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.post(
  '/upload-picture',
  auth,
  upload.single('profilePicture'), // expecting field name 'profilePicture'
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Save the relative path to DB, e.g., /uploads/profilePictures/filename.ext
      const profilePicturePath = `/uploads/profilePictures/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: profilePicturePath },
        { new: true }
      ).select('-password');

      res.json({
        message: 'Profile picture updated successfully',
        profilePicture: profilePicturePath,
        user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error uploading picture' });
    }
  }
);

module.exports = router;
