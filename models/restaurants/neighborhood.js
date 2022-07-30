const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  latitude: {
    type: Number,
    required: true,
  },
  
  longitude: {
    type: Number,
    required: true
  }
});

const Neighborhood = mongoose.model('Neighborhood', neighborhoodSchema);

module.exports = Neighborhood;