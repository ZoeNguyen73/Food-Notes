const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

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

  slug: {
    type: String,
    slug: "name",
  },

  restaurants: {
    type: [mongoose.ObjectId]
  }

});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;