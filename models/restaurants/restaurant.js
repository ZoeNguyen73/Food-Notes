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

  neighborhoods: {
    type: [Schema.Types.ObjectId]
  },

  categories: {
    type: [Schema.Types.ObjectId],
    required: true,
  },

  opening_hours: {
    type: [Object],
  },

  price: {
    type: String,
  },

  rating: {
    type: Schema.Types.Decimal128,
  },

  photos: {
    type: [String]
  },

  reviews: {
    type: [Schema.Types.ObjectId]
  },
  
});

const Restaurant= mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;