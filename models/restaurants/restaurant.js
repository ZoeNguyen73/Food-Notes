const mongoose = require('mongoose');
const neighborhoodModel = require('../neighborhoods/neighborhood');
const categoryModel = require('../categories/category');
const reviewModel = require('../reviews/review');
const boardModel = require('../boards/board');
const userModel = require('../users/user');
const filterList = require('../filter_list');

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
  },
  reviews: {
    type: [mongoose.ObjectId]
  },
  
});

//should return restaurants, neighborhoods, categories, 1st review of each restaurant, current day
//filters should be an object. eg. {neighborhood:["Bishan"], category:["Dim sum", "Seafood"]}

restaurantSchema.statics.getDataForList = async function(authUser, filters) {
  
  // get today day
  const day = new Date().getDay().toLocaleString('sg-SG');
  // const validFilters = filterList.restaurants;

  // get all neighborhoods
  const neighborhoods = await neighborhoodModel.find().exec();

  // get all categories
  const categories = await categoryModel.find().exec();

  let restaurants = null;

  
  // return current users' boards
  let boards = null;

  if (authUser !== null) {
    const user = await userModel.findOne({username: authUser}).exec();
    const user_id = user._id;
    boards = await boardModel.find({user_id}).exec();
  };

  // get all restaurants if no filters
  if (Object.keys(filters).length === 0) {
    restaurants = await this.find().exec();
  } else {
  // TODO: make filters work - note: need to filter by objectId not string
    // restaurants = await this.find({
    //   neighborhood: {
    //     $in: filters.neighborhood
    //   },
    //   categories: {
    //     $in: filters.categories
    //   }
    // }).exec();

    // get restaurants based on board slkug
    const board = await boardModel.findOne({slug: filters.board_slug}).exec();
    const boardRestaurants = board.restaurants;
    restaurants = await this.find({
      _id: {
        $in: boardRestaurants,
      },
    }).exec();

    
  };

  // get first review of every restaurant
  const reviews = [];
  for await (const restaurant of restaurants) {
    const firstReview = await reviewModel.findOne({restaurant_id: restaurant._id});
    reviews.push(firstReview);
  };

  return [restaurants, neighborhoods, categories, reviews, day, boards];

};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;