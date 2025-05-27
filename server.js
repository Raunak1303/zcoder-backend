const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const axios = require('axios'); // 👈 For Judge0 API
const Room = require('./models/Room'); // make sure this path is correct
const path = require('path');

// Load environment variables
dotenv.config();

// Routes
const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');
const profileRoutes = require('./routes/profile');
const bookmarkRoutes = require('./routes/bookmarks');
const roomRoutes = require('./routes/rooms');
const problemRoutes = require('./routes/problem');
const solutionRoutes = require('./routes/solution');
const commentRoutes = require('./routes/comment');
const executeRoutes = require('./routes/execute');
const codeExecutionRoute = require('./routes/codeExecution');

const allowedOrigins = [
  'http://localhost:3000',
  'https://zcoder-frontend.vercel.app'
];

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins, // ✅ Change this in production
    methods: ['GET', 'POST'],
    Credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/problem', problemRoutes);
app.use('/api/solution', solutionRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/codeexecution', codeExecutionRoute);
app.use('/uploads/profilePictures', express.static(path.join(__dirname, 'uploads/profilePictures')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ⚡ Judge0 API config
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
};

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join room
  socket.on('joinRoom', async ({ roomId, user }) => {
  socket.join(roomId);
  console.log(`📥 Socket ${socket.id} joined room ${roomId}`);

  try {
    // Add the user to the room's participants in DB if not already there
    const room = await Room.findById(roomId);
    const alreadyIn = room.participants.some(p => p.toString() === user._id);
    if (!alreadyIn) {
      room.participants.push(user._id);
      await room.save();
    }

    // Populate and emit updated participants
    const populatedRoom = await Room.findById(roomId).populate('participants', 'username email');
    io.to(roomId).emit('participantsUpdate', populatedRoom.participants);
  } catch (err) {
    console.error('Error adding participant to room:', err.message);
  }
  });

  // Chat message
  socket.on('sendMessage', ({ roomId, message, user }) => {
    socket.to(roomId).emit('receiveMessage', { message, user });
  });

  // Real-time code sync
  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeUpdate', code);
  });

  // ✅ Real-time code execution
  socket.on('runCode', async ({ roomId, code, language_id, stdin }) => {
    try {
      const response = await axios.post(JUDGE0_URL, {
        source_code: code,
        language_id,
        stdin
      }, {
        headers: JUDGE0_HEADERS
      });

      const { stdout, stderr, status, compile_output, message } = response.data;

      // Send result to all users in room
      io.to(roomId).emit('executionResult', {
        status: status.description,
        output: stdout || stderr || compile_output || message || 'No output',
      });

    } catch (err) {
      console.error('Code execution error:', err.message);
      io.to(roomId).emit('executionResult', {
        status: 'Error',
        output: 'Execution failed. Please try again.'
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
