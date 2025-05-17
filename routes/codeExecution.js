const express = require('express');
const axios = require('axios');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/authMiddleware');

// Replace with your actual Judge0 API URL and key
const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY // 🔐 Replace this with your actual API key
};

router.post('/submit', auth, async (req, res) => {
  try {
    const { code, languageId, problemId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const submissionPayload = {
      source_code: code,
      language_id: languageId,
      stdin: problem.inputTestCase,
      expected_output: problem.expectedOutput
    };

    const response = await axios.post(JUDGE0_API, submissionPayload, { headers: JUDGE0_HEADERS });

    const result = response.data;

    // Determine correctness
    const passed = result.status.id === 3; // 3 = Accepted

    res.json({
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory,
      passed
    });
  } catch (error) {
    console.error('Code execution error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Execution error', error: error.response?.data || error.message });
  }
});

module.exports = router;
