const restaurantModel = require('../models/restaurants/restaurant');
const neighborhoodModel = require('../models/neighborhoods/neighborhood');
const categoryModel = require('../models/categories/category');
const reviewModel = require('../models/reviews/review');
const userModel = require('../models/users/user');
const boardModel = require('../models/boards/board');

const controller = {
  list: async (req, res) => {
    const authUser = req.session.user || null;

    try {
      const [restaurants, neighborhoods, categories, reviews, day, boards] 
      = await restaurantModel.getDataForList(authUser, {});

      res.render('restaurants/index', {restaurants, neighborhoods, categories, reviews, day, boards});
      return;

    } catch(err) {
      console.log(`Error getting restaurant lists: ${err}`);
    };
    
    res.render('restaurants/index', {restaurants:[]});
  },

  show: async (req, res) => {
    let restaurant = null;
    try {
      restaurant = await restaurantModel.findOne({slug: req.params.restaurant_slug}).exec();

      // get all categories
      const categories = await categoryModel.find().exec();

      // get all reviews from the restaurant
      const reviews = await reviewModel.find({restaurant_id: restaurant._id}).exec();

      // create map
      // const map = L.map('map').setView([restaurant.coordinates.latitude, restaurant.coordinates.longitude, ], 13);
      // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //   maxZoom: 19,
      //   attribution: '© OpenStreetMap'
      // }).addTo(map);

      res.render('restaurants/show', {restaurant, categories, reviews});
      return;

    } catch(err) {
      console.log(`Error getting restaurant lists: ${err}`);
    };
    
    res.render('restaurants/show', {restaurant});
  
  },

  addToBoard: async (req, res) => {
    let board = null;
    const redirect = req.query.redirect || null;
    console.log(`redirect url is ${redirect}`);
    try {
      const restaurant = await restaurantModel.findOne({slug: req.params.restaurant_slug}).exec();
      const restaurant_id = await restaurant._id;

      board = await boardModel.findOne({_id: req.body.board_id}).exec();
      const boardRestaurants = board.restaurants;

      if (!boardRestaurants.includes(restaurant_id)) {
        await boardModel.findOneAndUpdate({_id: req.body.board_id}, {$push: {restaurants: restaurant_id}});
      };
    } catch(err) {
      console.log(`Error adding restaurant to board: ${err}`);
    };

    res.redirect(`/${req.session.user}/boards/${board.slug}`);
  },
};

module.exports = controller;