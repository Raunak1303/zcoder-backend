const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  snippet: { type: mongoose.Schema.Types.ObjectId, ref: 'Snippet' },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }, // 🔥 Added
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
