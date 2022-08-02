const restaurantModel = require('../models/restaurants/restaurant');
const neighborhoodModel = require('../models/restaurants/neighborhood');
const categoryModel = require('../models/categories/category');
const reviewModel = require('../models/reviews/review');

const controller = {
  list: async (req, res) => {
    const restaurants = await restaurantModel.find().exec();
    
    // get all neighborhoods
    const neighborhoods = await neighborhoodModel.find().exec();

    // get all categories
    const categories = await categoryModel.find().exec();

    // get only the first reviews of each restaurants
    const reviews = [];
    for await (const restaurant of restaurants) {
      const firstReview = await reviewModel.findOne({restaurant_id: restaurant._id});
      reviews.push(firstReview);
    };

    // get today day
    const day = new Date().getDay().toLocaleString('sg-SG');

    res.render('restaurants/index', {restaurants, neighborhoods, categories, reviews, day});
  },

  show: async (req, res) => {
    const restaurant = await restaurantModel.findOne({slug: req.params.restaurant_slug}).exec();

    // get all categories
    const categories = await categoryModel.find().exec();

    // get all reviews from the restaurant
    const reviews = await reviewModel.find({restaurant_id: restaurant._id}).exec();

    res.render('restaurants/show', {restaurant, categories, reviews});
  }
};

module.exports = controller;