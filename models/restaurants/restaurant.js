const mongoose = require('mongoose');
const neighborhoodModel = require('../neighborhoods/neighborhood');
const categoryModel = require('../categories/category');
const reviewModel = require('../reviews/review');
const boardModel = require('../boards/board');
const userModel = require('../users/user');

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

  if (authUser !== null) {
    const user = await userModel.findOne({username: authUser}).exec();
    const user_id = user._id;
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
      const id = await category._id;
      categoryIDs.push(id);
    };
  } else {
    const ids = await categoryModel.find({}, '_id').exec();
    for await (const id of ids) {
      categoryIDs.push(id);
    };
  };

  // get restaurantIDs for board restaurants
  if (filters.board_slug) {
    const board = await boardModel.findOne({slug: filters.board_slug}).exec();
    const bRestaurants = board.restaurants;
    for await (const id of bRestaurants) {
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

  // get all restaurants if no filters
  // if (filters.neighborhoods) {
  //   if (filters.categories) {
  //     const count = await this.countDocuments({
  //       neighborhood: {
  //         $in: [],
  //       },
  //       categories: {
  //         $in: categoryIDs,
  //       }
  //     });
  //     totalPages = Math.ceil(count / limit);
  
  //     restaurants = await this.find({
  //       neighborhood: {
  //         $in: [],
  //       },
  //       categories: {
  //         $in: categoryIDs,
  //       }
  //     })
  //     .limit(limit * 1)
  //     .skip((page - 1) * limit)
  //     .exec();

  //   } else {
  //     const count = await this.countDocuments({
  //       neighborhood: {
  //         $in: neighborhoodIDs,
  //       }
  //     });
  //     totalPages = Math.ceil(count / limit);
  
  //     restaurants = await this.find({
  //       neighborhood: {
  //         $in: neighborhoodIDs,
  //       }
  //     })
  //     .limit(limit * 1)
  //     .skip((page - 1) * limit)
  //     .exec();
  //   };
    
  // } else if (filters.categories) {
  //   const count = await this.countDocuments({
  //     categories: {
  //       $in: categoryIDs,
  //     }
  //   });
  //   totalPages = Math.ceil(count / limit);

  //   restaurants = await this.find({
  //     categories: {
  //       $in: categoryIDs,
  //     }
  //   })
  //   .limit(limit * 1)
  //   .skip((page - 1) * limit)
  //   .exec();

  // } else if (filters.board_slug) {
  // // TODO: make filters work - note: need to filter by objectId not string
  //   // restaurants = await this.find({
  //   //   neighborhood: {
  //   //     $in: filters.neighborhood
  //   //   },
  //   //   categories: {
  //   //     $in: filters.categories
  //   //   }
  //   // }).exec();

  //   // get restaurants based on board slug
  //   const board = await boardModel.findOne({slug: filters.board_slug}).exec();
  //   const boardRestaurants = board.restaurants;
  //   totalPages = Math.ceil(boardRestaurants.length / limit);
  //   restaurants = await this.find({
  //     _id: {
  //       $in: boardRestaurants,
  //     },
  //   })
  //   .limit(limit * 1)
  //   .skip((page - 1) * limit)
  //   .exec();

  // } else {

  //   const count = await this.countDocuments();
  //   totalPages = Math.ceil(count / limit);
  //   restaurants = await this.find()
  //     .limit(limit * 1)
  //     .skip((page - 1) * limit)
  //     .exec();

  // };

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

  let boards = null;
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
  };

  // TODO: get map info
  // create map
  // const map = L.map('map').setView([restaurant.coordinates.latitude, restaurant.coordinates.longitude, ], 13);
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   maxZoom: 19,
  //   attribution: '© OpenStreetMap'
  // }).addTo(map);

  return [restaurantBoards, boards, categories, reviews];
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;