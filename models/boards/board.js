const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },

  name: {
    type: String,
    requried: true
  },

  description: {
    type: String,
  },

  restaurants: {
    type: [mongoose.ObjectId]
  }
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;