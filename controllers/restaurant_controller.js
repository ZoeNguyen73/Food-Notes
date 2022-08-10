const restaurantModel = require('../models/restaurants/restaurant');
const neighborhoodModel = require('../models/neighborhoods/neighborhood');
const categoryModel = require('../models/categories/category');
const reviewModel = require('../models/reviews/review');
const userModel = require('../models/users/user');
const boardModel = require('../models/boards/board');

const controller = {
  list: async (req, res) => {
    res.locals.page = 'restaurants-index';
    const authUser = req.session.user || null;
    const redirect = req.originalUrl;
    let restaurants = null;
    let neighborhoods = null;
    let categories = null;
    let reviews = null;
    let day = null;
    let boards = null;
    let totalPages = 1;
    const { page = 1, limit = 36 } = req.query;

    try {
      [restaurants, neighborhoods, categories, reviews, day, boards, totalPages] 
      = await restaurantModel.getDataForList(authUser, {}, page, limit);

    } catch(err) {
      console.log(`Error getting restaurant lists: ${err}`);
    };
    
    res.render('restaurants/index', {
      restaurants, 
      neighborhoods, 
      categories, 
      reviews, 
      day, 
      boards, 
      redirect,
      totalPages,
      currentPage: page,
      pageUrl: '/restaurants'
    });
  },

  show: async (req, res) => {
    const authUser = req.session.user || null;
    const redirect = req.originalUrl;
    let restaurant = null;
    let restaurantBoards = null;
    let boards = null;
    let categories = null;
    let reviews = null;

    try {
      restaurant = await restaurantModel.findOne({slug: req.params.restaurant_slug}).exec();

      [restaurantBoards, boards, categories, reviews] 
      = await restaurant.getRestaurantInfo(authUser);

    } catch(err) {
      console.log(`Error getting restaurant details: ${err}`);
    };
    
    res.render('restaurants/show', {restaurant, categories, reviews, restaurantBoards, boards, redirect});
  
  },

  addToBoard: async (req, res) => {
    let board = null;
    const redirect = req.query.redirect || null;

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

    if (redirect) {
      // TODO: figure out how to not reload restaurants page
      res.redirect(`${redirect}`);
      return;
    };

    res.redirect(`/${req.session.user}/boards/${board.slug}`);
  },

  removeFromBoard: async (req, res) => {
    const boardSlugs = Object.keys(req.body);
    let board = null;
    const redirect = req.query.redirect || null;

    try {
      const restaurant = await restaurantModel.findOne({slug: req.params.restaurant_slug}).exec();
      const restaurant_id = await restaurant._id;;

      for await (const slug of boardSlugs) {
        board = await boardModel.findOne({slug}).exec();
        const boardRestaurants = board.restaurants;

        if (boardRestaurants.includes(restaurant_id)) {
          await boardModel.updateOne({slug}, {$pull: {restaurants: restaurant_id}});
        };
      };

    } catch(err) {
      console.log(`Error removing restaurant from board: ${err}`);
    };

    if (redirect) {
      // TODO: figure out how to not reload restaurants page
      res.redirect(`${redirect}`);
      return;
    };

    res.redirect(`/${req.session.user}/boards/${board.slug}`);
  }
};

module.exports = controller;