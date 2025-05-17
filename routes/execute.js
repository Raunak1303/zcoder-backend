const express = require('express');
const axios = require('axios');
const router = express.Router();

// Your Judge0 API base URL
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';

// ⚠️ Replace with your RapidAPI key
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

// POST /api/execute
router.post('/', async (req, res) => {
  const { code, language_id, stdin } = req.body;

  if (!code || !language_id) {
    return res.status(400).json({ message: 'Code and language_id are required.' });
  }

  try {
    const response = await axios.post(JUDGE0_URL, {
      source_code: code,
      language_id,
      stdin
    }, {
      headers: JUDGE0_HEADERS
    });

    const { stdout, stderr, status, compile_output, message } = response.data;

    res.json({
      status: status.description,
      output: stdout || stderr || compile_output || message || 'No output',
    });
  } catch (err) {
    console.error('Code execution error:', err);
    res.status(500).json({ message: 'Error executing code' });
  }
});

module.exports = router;
