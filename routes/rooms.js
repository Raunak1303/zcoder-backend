const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/authMiddleware');

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Check for unique room name
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = new Room({
      name,
      description: description || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.user.id,
      participants: [req.user.id]
    });

    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all rooms (optionally filter by public rooms only)
router.get('/', auth, async (req, res) => {
  try {
    const { publicOnly } = req.query;
    let filter = {};
    if (publicOnly === 'true') filter.isPublic = true;

    const rooms = await Room.find(filter).populate('createdBy', 'username').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room by id
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('participants', 'username').populate('createdBy', 'username');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a room
router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already joined' });
    }

    room.participants.push(req.user.id);
    await room.save();

    res.json({ message: 'Joined room', room });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a room
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.participants = room.participants.filter(p => p.toString() !== req.user.id);
    await room.save();

    res.json({ message: 'Left room', room });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a room (only by creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Room.deleteOne({ _id: req.params.id });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
