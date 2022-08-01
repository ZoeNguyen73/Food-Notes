const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  yelp_id: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true
  },

  display_location: {
    type: Object,
    required: true,
  },

  display_phone: {
    type: String,
  },

  coordinates: {
    type: Object,
    required: true
  },

  neighborhood: {
    type: mongoose.ObjectId,
  },

  categories: {
    type: [mongoose.ObjectId],
    required: true,
  },

  opening_hours: {
    type: [Object],
  },

  price: {
    type: String,
  },

  rating: {
    type: mongoose.Decimal128,
  },

  photos: {
    type: [String]
  },

  main_photo_id: {
    type: Number,
    required: true
  }
,
  reviews: {
    type: [mongoose.ObjectId]
  },
  
});

const Restaurant= mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;