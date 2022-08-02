const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.ObjectId,
    required: true
  },

  name: {
    type: String,
    requried: true
  },

  restaurants: {
    type: [mongoose.ObjectId]
  }
  
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;