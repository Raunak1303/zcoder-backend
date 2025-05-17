const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Bookmark = require('../models/Bookmark');

// Add a new bookmark
router.post('/:snippetId', auth, async (req, res) => {
  try {
    const existing = await Bookmark.findOne({
      user: req.user.id,
      snippet: req.params.snippetId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }

    const newBookmark = new Bookmark({
      user: req.user.id,
      snippet: req.params.snippetId,
    });

    await newBookmark.save();
    res.status(201).json(newBookmark);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookmarks of the user
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).populate('snippet');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a bookmark
router.delete('/:snippetId', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      snippet: req.params.snippetId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
