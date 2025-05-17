const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');
const Solution = require('../models/Solution');
const Problem = require('../models/Problem');

// Submit a solution to a problem
router.post('/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { code, language } = req.body;

    // Validate problemId format
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: 'Invalid Problem ID format' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const newSolution = new Solution({
      problemId,
      user: req.user.id,
      code,
      language,
    });

    await newSolution.save();
    res.status(201).json(newSolution);
  } catch (err) {
    console.error('Submit solution error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all solutions for a problem
router.get('/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;

    // Validate problemId format
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: 'Invalid Problem ID format' });
    }

    const solutions = await Solution.find({ problemId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(solutions);
  } catch (err) {
    console.error('Get solutions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
