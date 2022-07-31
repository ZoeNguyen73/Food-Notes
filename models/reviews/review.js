const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },

  restaurant_id: {
    type: mongoose.ObjectId,
    required: true
  },

  rating: {
    type: Number,
    min: [1, "must be betwen 1 - 5"],
    max: [5, "must be betwen 1 - 5"],
    required: true
  },

  content: {
    type: String
  },

  time_created: {
    type: String
  },
  
  yelp_name: {
    type: String
  },

  yelp_pic: {
    type: String
  }

});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;