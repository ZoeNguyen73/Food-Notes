const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  //TODO: to change to "name" instead for consistency
  display_name: {
    type: String,
    required: true,
    unique: true
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;