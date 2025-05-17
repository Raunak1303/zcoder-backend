const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const Solution = require('../models/Solution');

// Add a comment to a solution
router.post('/:solutionId', auth, async (req, res) => {
  try {
    const { text } = req.body;

    // Check if solution exists
    const solution = await Solution.findById(req.params.solutionId);
    if (!solution) return res.status(404).json({ message: 'Solution not found' });

    const comment = new Comment({
      solutionId: req.params.solutionId,
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

// Get all comments for a solution
router.get('/:solutionId', async (req, res) => {
  try {
    const comments = await Comment.find({ solutionId: req.params.solutionId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
