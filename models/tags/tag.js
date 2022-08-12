const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

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
  },

  slug: {
    type: String,
    requried: true
  },
  
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;