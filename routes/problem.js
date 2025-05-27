const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/authMiddleware');

// Create a new coding problem
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, difficulty, tags, inputTestCase, expectedOutput } = req.body;

    if (!title || !description || !inputTestCase || !expectedOutput) {
      return res.status(400).json({ message: 'Title, description, input test case, and expected output are required' });
    }

    const problem = new Problem({
      title,
      description,
      difficulty: difficulty || 'Easy',
      tags: tags || [],
      inputTestCase,
      expectedOutput,
      createdBy: req.user.id
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all problems (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { difficulty, tag, page = 1, limit = 5 } = req.query;
    const filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag;

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Problem.countDocuments(filter);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get a specific problem by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
