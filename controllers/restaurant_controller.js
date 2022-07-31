const model = require('../models/restaurants/restaurant');

const controller = {
  list: async (req, res) => {
    res.render('restaurants/index', {restaurants});
  },

  show: async (req, res) => {
    const restaurant = await model.findOne({slug: req.params.restaurant_slug}).exec();
    res.render('restaurants/show', {restaurant});
  }
};

module.exports = controller;