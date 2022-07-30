const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  email_address: {
    type: String,
    required: true,
    unique: true
  },

  hashed_password: {
    type: String,
    required: true
  },

  date_of_birth: {
    type: Date,
  },

  pic_url: {
    type: String
  },

  ig_handle: {
    type: String
  },

  tiktok_handle: {
    type: String
  }

});

const User = mongoose.model('User', userSchema);

module.exports = User;