// import bcrypt
const bcrypt = require('bcrypt');

// importing models
const restaurantModel = require('../../models/restaurants/restaurant');
const categoryModel = require('../../models/categories/category');
const neighborhoodModel = require('../../models/restaurants/neighborhood');
const reviewModel = require('../../models/reviews/review');
const userModel = require('../../models/users/user');

// importing seed data
const neighborhoods = require('../seed_data/neighborhoods');
const users = require('../seed_data/users');

// import yelp api script
const yelpApi = require('../../public/api/yelp_api');

const seed = {
  init: async function() {
    try {
      // await this.seedNeighborhoods();
      // await this.seedUsers();
      this.seedRestaurants();
      // await this.seedReviews();

      console.log('seeding successful');
      
    } catch(err) {
      console.log(`seeding unsuccessful. err is: ${err}`);
    };
  },

  // init: function () {
  //   this.seedRestaurants();
  // },

  seedNeighborhoods: () => {
    Object.entries(neighborhoods).forEach(([name, latlong]) => {
      neighborhoodModel.create({
        name,
        latitude: latlong.latitude,
        longitude: latlong.longitude
      });
    });
  },

  seedUsers: () => {
    Object.entries(users).forEach(([username, info]) => {
      userModel.create({
        username,
        email_address: info.email_address,
        hashed_password: bcrypt.hashSync(info.password_str, 10),
        pic_url: info.pic_url
      });
    });
  },

  seedRestaurants: () => {
    // looping through neighborhoods
    const simplifiedNeighborhoods = {
      "Ang Mo Kio": {
        latitude: 1.369115,
        longitude: 103.845436,
      },
    };
    Object.entries(simplifiedNeighborhoods).forEach(async ([neighborhoodName, latlong]) => {

      // for each neighborhood, call Yelp API to get 50 restaurants
      const data = await yelpApi.searchRestaurants(latlong.latitude, latlong.longitude);
      const restaurants = data.businesses;

      restaurants.forEach(async (restaurant) =>  {
        
        const yelp_id = restaurant.id;

        // get restaurant details from details api
        const restaurantDetails = await yelpApi.getRestaurantDetails(yelp_id);

        const categoriesWithAsync = await restaurantDetails.categories;
        console.log(`
          current yelp_id is ${yelp_id} and
          restaurant is ${restaurantDetails.name} and
          categories are ${restaurantDetails.categories} and
          categories with async is ${categoriesWithAsync}`);

        // get restaurant from database - return null if not exist yet
        const restaurantInDb = await restaurantModel.findOne({yelp_id}).exec();

        // get neighborhood id
        const currentNeighborhood = await neighborhoodModel.findOne({name: neighborhoodName,}).exec();

        // if restaurant already exists in DB, add neighborhood to neighborhoods
        if (restaurantInDb) {
          restaurantModel.updateOne(
            { yelp_id },
            { $push: {neighborhoods: currentNeighborhood._id}}
          );

        } else {
          // if restaurant has not existed in DB, create a new restaurant

          // first, add categories to categories collection
          restaurantDetails.categories.forEach(async (category) => {
            await categoryModel.create({display_name: category.title});
          });

          // then put categories ID into an array
          const categoriesArr = categories.map(async (category) => {
            (await categoryModel.findOne({display_name: category.title}).exec())._id;
          });

          // Todo: then get opening hrs

          // finally, create the restaurant
          restaurantModel.create({
            yelp_id,
            name: restaurantDetails.name,
            slug: restaurantDetails.url.split('?')[0].split('/').pop(),
            display_location: restaurantDetails.location.display_address.join(','),
            display_phone: restaurantDetails.phone,
            coordinates: {
              latitude: restaurantDetails.coordinates.latitude,
              longitude: restaurantDetails.coordinates.longitude
            },
            neighborhoods: [currentNeighborhood._id],
            categories: categoriesArr,
            rating: restaurantDetails.rating,
            price: restaurantDetails.price,
            photos: [...restaurantDetails.photos],
            opening_hours: {},

          });
        };
        
      });
    });

  },

};

module.exports = seed;


