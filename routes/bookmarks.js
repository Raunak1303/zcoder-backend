// bookmarks.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Bookmark = require('../models/Bookmark');

// Bookmark a problem
router.post('/problem/:id', auth, async (req, res) => {
  try {
    const existing = await Bookmark.findOne({
      user: req.user.id,
      problem: req.params.id,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }

    const newBookmark = new Bookmark({
      user: req.user.id,
      problem: req.params.id,
    });

    await newBookmark.save();
    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Bookmark problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove problem bookmark
router.delete('/problem/:id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      problem: req.params.id,
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookmarks
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).populate('problem');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
