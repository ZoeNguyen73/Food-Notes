const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },

  restaurant_id: {
    type: Schema.Types.ObjectId,
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

  date_created: {
    type: Date
  }

});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;