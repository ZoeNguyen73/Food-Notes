const restaurantModel = require('../models/restaurants/restaurant');
const neighborhoodModel = require('../models/neighborhoods/neighborhood');
const categoryModel = require('../models/categories/category');
const reviewModel = require('../models/reviews/review');

const controller = {
  loadHomePage: async (req, res) => {
    // get today day
    const day = new Date().getDay().toLocaleString('sg-SG');

    // get all neighborhoods
    const neighborhoods = await neighborhoodModel.find().exec();

    // get all categories
    const categories = await categoryModel.find().exec();

    const restaurantIDs = [
      '62f3b9892e622aff7baab133',
      '62f3bb7a2e622aff7babeaa7',
      '62f3bc5b2e622aff7bac7e58',
      '62f3be972e622aff7badddf7'
    ];

    const reviews = [];
  
    try {
      restaurants = await restaurantModel.find({_id: {$in: restaurantIDs}}).exec();
      for await (const restaurant of restaurants) {
        const firstReview = await reviewModel.findOne({restaurant_id: restaurant._id});
        if (firstReview) {
          reviews.push(firstReview);
        };
      };
    } catch(err) {
      console.log(`Error getting restaurant lists: ${err}`);
    };

    res.render('pages/index', {
      restaurants, 
      neighborhoods, 
      categories, 
      reviews, 
      day,
      baseUrl: '/restaurants'
    })
  }
};

module.exports = controller;