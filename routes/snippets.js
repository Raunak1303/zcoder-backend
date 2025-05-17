const express = require('express');
const router = express.Router();
const Snippet = require('../models/Snippet');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new snippet
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, code, language } = req.body;
    const user = req.user.id; // from authMiddleware

    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code, and language are required' });
    }

    const newSnippet = new Snippet({
      title,
      description,
      code,
      language,
      user,
    });

    await newSnippet.save();
    res.status(201).json(newSnippet);
  } catch (error) {
    console.error('Snippet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all snippets of logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete snippet by id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Check user ownership
    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Snippet.deleteOne({ _id: req.params.id });;
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
