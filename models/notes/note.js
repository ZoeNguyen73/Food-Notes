const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    required: true
  },

  restaurant_id: {
    type: mongoose.ObjectId,
    required: true
  },

  note: {
    type: String,
    requried: true
  },
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;