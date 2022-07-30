const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  yelp_alias: {
    type: String,
    unique: true
  },

  display_name: {
    type: String,
    required: true,
    unique: true
  }

});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;