const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  user_id: {
    type: [mongoose.ObjectId],
    required: true
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  isPublic: {
    type: Boolean,
    required: true
  },

  restaurants: {
    type: [mongoose.ObjectId]
  }

});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;