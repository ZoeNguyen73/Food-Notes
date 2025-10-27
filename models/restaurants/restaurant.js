const mongoose = require('mongoose');
const neighborhoodModel = require('../neighborhoods/neighborhood');
const categoryModel = require('../categories/category');
const reviewModel = require('../reviews/review');
const boardModel = require('../boards/board');
const userModel = require('../users/user');
const tagModel = require('../tags/tag');

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

restaurantSchema.statics.getDataForList = async function(authUser, filters, page, limit) {
  
  // get today day
  const day = new Date().getDay().toLocaleString('sg-SG');

  // get all neighborhoods
  const neighborhoods = await neighborhoodModel.find().exec();

  // get all categories
  const categories = await categoryModel.find().exec();

  let restaurants = null;

  // return current users' boards
  let boards = null;
  let user_id = null;

  if (authUser !== null) {
    const user = await userModel.findOne({username: authUser}).exec();
    user_id = user._id;
    boards = await boardModel.find({user_id}).exec();
  };

  let totalPages = null;

  const neighborhoodIDs = [];
  const categoryIDs = [];
  const restaurantIDs = [];

  // get neighborhoodID for each neighborhood
  if (filters.neighborhoods) {
    for await (const n of filters.neighborhoods) {
      const neighborhood = await neighborhoodModel.findOne({name: n}).exec();
      const id = await neighborhood._id;
      neighborhoodIDs.push(id);
    };
  } else {
    const ids = await neighborhoodModel.find({}, '_id').exec();
    for await (const id of ids) {
      neighborhoodIDs.push(id);
    };
  };

  // get categoryID for each category
  if (filters.categories) {
    for await (const c of filters.categories) {
      const name = c.replace('and', '&');
      const category = await categoryModel.findOne({name}).exec();
      const id = category._id;
      categoryIDs.push(id);
    };
  } else {
    const ids = await categoryModel.find({}, '_id').exec();
    for await (const id of ids) {
      categoryIDs.push(id);
    };
  };

  // get restaurantIDs for board restaurants
  console.log('filters received are', JSON.stringify(filters));
  if (filters.board_slug) {
    let board;
    if (user_id) {
      board = await boardModel.findOne({ slug: filters.board_slug, user_id }).exec();
    } else {
      board = await boardModel.findOne({slug: filters.board_slug}).exec();
    }
    console.log('board slug', filters.board_slug);
    console.log('board found: ', board._id);
    const bRestaurants = board.restaurants;
    for await (const id of bRestaurants) {
      console.log('restaurant ID in board: ', id);
      restaurantIDs.push(id);
    };
  } else {
    const ids = await this.find({}, '_id').exec();
    for await (const id of ids) {
      restaurantIDs.push(id);
    };
  };

  // get restaurants
  const count = await this.countDocuments({
    neighborhood: {
      $in: neighborhoodIDs
    },
    categories: {
      $in: categoryIDs
    },
    _id: {
      $in: restaurantIDs
    } 
  }).exec();

  totalPages = Math.ceil(count / limit);

  restaurants = await this.find({
    neighborhood: {
      $in: neighborhoodIDs
    },
    categories: {
      $in: categoryIDs
    },
    _id: {
      $in: restaurantIDs
    } 
  })
  .limit(limit * 1)
  .skip((page - 1) * limit)
  .exec();;

  // get first review of every restaurant
  const reviews = [];
  for await (const restaurant of restaurants) {
    const firstReview = await reviewModel.findOne({restaurant_id: restaurant._id});
    if (firstReview) {
      reviews.push(firstReview);
    };
  };

  return [restaurants, neighborhoods, categories, reviews, day, boards, totalPages];

};

restaurantSchema.methods.getRestaurantInfo = async function(authUser) {

  // get all categories
  const categories = await categoryModel.find().exec();
  
  // get all reviews from the restaurant
  const reviews = await reviewModel.find({restaurant_id: this._id}).exec();
  const usernames = {};

  for await (const review of reviews) {
    const user_id = review.user_id;
    if (!user_id.includes('yelp')) {
      const user = await userModel.findOne({_id: user_id}).exec();
      const username = user.username;
      usernames[review._id] = username;
    };
    
  };

  let boards = null;
  let tags = [];
  const restaurantBoards = [];

  if (authUser !== null) {
    const user = await userModel.findOne({username: authUser}).exec();
    const user_id = user._id;
    boards = await boardModel.find({user_id}).exec();

    boards.forEach(board => {
      if (board.restaurants.includes(this._id)) {
        restaurantBoards.push(board);
      };
    });

    tags = await tagModel.find({user_id}).exec();
  };

  // TODO: get map info
  // create map
  // const map = L.map('map').setView([restaurant.coordinates.latitude, restaurant.coordinates.longitude, ], 13);
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   maxZoom: 19,
  //   attribution: '© OpenStreetMap'
  // }).addTo(map);

  return [restaurantBoards, boards, categories, reviews, tags, usernames];
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;