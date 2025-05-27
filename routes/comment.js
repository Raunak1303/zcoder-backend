const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const Problem = require('../models/Problem');

// POST comment on a problem
router.post('/:problemId', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const problem = await Problem.findById(req.params.problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const comment = new Comment({
      problemId: req.params.problemId,
      user: req.user.id,
      text
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all comments for a problem
router.get('/:problemId', async (req, res) => {
  try {
    const comments = await Comment.find({ problemId: req.params.problemId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
