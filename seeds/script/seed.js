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

    const test = {
      "Ang Mo Kio": {
        latitude: 1.369115,
        longitude: 103.845436,
      },
      Bishan: {
        latitude: 1.352585,
        longitude: 103.835213,
      }
    };

    try {
      // await this.seedNeighborhoods();
      // await this.seedUsers();
      // await this.getRestaurantsdata();
      await this.seedRestaurants();
      // await this.seedReviews();
      
    } catch(err) {
      console.log(`seeding unsuccessful. err is: ${err}`);
    };
  },

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
    // neighborhoods for testing
    const test = {
      "Ang Mo Kio": {
        latitude: 1.369115,
        longitude: 103.845436,
      },
      Bishan: {
        latitude: 1.352585,
        longitude: 103.835213,
      }
    };

    // looping through neighborhoods
    Object.entries(test).forEach(async ([neighborhoodName, latlong]) => {

      // for each neighborhood, call Yelp API to get restaurants
      const data = await yelpApi.searchRestaurants(latlong.latitude, latlong.longitude);
      const restaurants = await data.businesses;

      // get details for each restaurant
      restaurants.forEach((restaurant, i) =>  {

        // set timeout to not go over QPS limit
        setTimeout(async () => {
          const yelp_id = restaurant.id;

          // get restaurant details from details api
          const restaurantDetails = await yelpApi.getRestaurantDetails(yelp_id);
          console.log(`current neighborhood is ${neighborhoodName} and current restaurant is: ${restaurantDetails.name}`);
        
          // get neighborhood id
          const currentNeighborhood = await neighborhoodModel.findOne({name: neighborhoodName}).exec();

          // create categories in database
          const categories = restaurantDetails.categories.map(category => category.title);
          const categoriesIds = [];

          //create new category if not exist
          for await (const category of categories) {
            let id = null;
            try {
              const categoryDoc = await categoryModel.findOneAndUpdate(
                {display_name: category},
                {display_name: category},
                {upsert: true}
              );
  
              id = categoryDoc._id; 
              categoriesIds.push(id);

            } catch(err) {
              console.log(`err in adding categories: ${err}`);
            };
          };

          // create new restaurant in database if not exist
          await restaurantModel.findOneAndUpdate(
            // filter by yelp_id
            {yelp_id: restaurant.id},

            // restaurant details
            {
              yelp_id: restaurant.id,
              name: restaurantDetails.name,
              slug: restaurantDetails.url.split('?')[0].split('/').pop(),
              display_location: restaurantDetails.location.display_address.join(','),
              display_phone: restaurantDetails.phone,
              coordinates: {
                latitude: restaurantDetails.coordinates.latitude,
                longitude: restaurantDetails.coordinates.longitude
              },
              neighborhood: currentNeighborhood._id,
              categories: [...categoriesIds],
              rating: restaurantDetails.rating,
              price: restaurantDetails.price,
              photos: [...restaurantDetails.photos],
              opening_hours: [...restaurantDetails.hours[0].open],
            },

            // option: to upsert
            {upsert: true}
          );
        }, i * 400);
      });
        
    });

  },

};

module.exports = seed;


