// import bcrypt
const bcrypt = require('bcrypt');

// importing models
const restaurantModel = require('../../models/restaurants/restaurant');
const categoryModel = require('../../models/categories/category');
const neighborhoodModel = require('../../models/neighborhoods/neighborhood');
const reviewModel = require('../../models/reviews/review');
const userModel = require('../../models/users/user');

// importing seed data
const neighborhoods = require('../seed_data/neighborhoods');
const users = require('../seed_data/users');

// import yelp api script
const {searchLimit, yelpApi} = require('../../public/api/yelp_api');

const queryInterval = 400;

const seed = {
  init: async function() {
    // check if data has already been seeded befpre
    const isNotEmpty = (await neighborhoodModel.find({})).length;

    if (isNotEmpty) return;

    try {
      await this.seedNeighborhoods();
      await this.seedUsers();
      await this.seedRestaurants();
    } catch(err) {
      console.log(`seeding unsuccessful. err is: ${err}`);
    };
  },

  seedNeighborhoods: async () => {
    try {
      await Object.entries(neighborhoods).forEach(async([name, latlong]) => {
        try {
          await neighborhoodModel.create({
            name,
            latitude: latlong.latitude,
            longitude: latlong.longitude
          });
          
        } catch(err) {
          console.log(`err in creating new neighborhood in DB: ${err}`);
        }
      });
      console.log(`<---- seeding neighborhoods: DONE ---->`);
    } catch(err) {
      console.log(`err in seeding neighborhoods: ${err}`)
    };
    
  },

  seedUsers: async () => {
    try {
      await Object.entries(users).forEach(async ([username, info]) => {
        try {
          await userModel.create({
            username,
            email_address: info.email_address,
            hashed_password: bcrypt.hashSync(info.password_str, 10),
            pic_url: info.pic_url
          });
        } catch(err) {
          console.log(`err in creating new user in DB: ${err}`);
        }
      });
      console.log(`<---- seeding users: DONE ---->`);
    } catch(err) {
      console.log(`err in seeding users: ${err}`);
    }; 
  },

  seedRestaurants: async () => {
    // neighborhoods for testing
    const test = [
      {
        'Ang Mo Kio': {
          latitude: 1.369115,
          longitude: 103.845436,
        },
      },
      {
        Bishan: {
          latitude: 1.352585,
          longitude: 103.835213,
        }
      }
    ]

    try {
      // looping through neighborhood
      for await (const neighborhood of test) {
        // for each neighborhood, call Yelp API to get restaurants
        const neighborhoodName = Object.keys(neighborhood)[0];
        const data = await yelpApi.searchRestaurants(neighborhood[neighborhoodName].latitude, neighborhood[neighborhoodName].longitude);
        const restaurants = await data.businesses;

        // get details for each restaurant
        for await (const restaurant of restaurants) {
          // set timeout to not go over QPS limit
          const i = restaurants.indexOf(restaurant);
          setTimeout(async () => {
            const yelp_id = restaurant.id;

            // get restaurant details from details api
            const restaurantDetails = await yelpApi.getRestaurantDetails(yelp_id);
            console.log(`current neighborhood is ${neighborhoodName} and current restaurant is: ${restaurantDetails.name}`);

            // get neighborhood id
            const currentNeighborhood = await neighborhoodModel.findOne({ name: neighborhoodName }).exec();

            // create categories in database
            const categories = restaurantDetails.categories.map(category => category.title);

            for await (const category of categories) {
              let id = null;
              try {
                await categoryModel.findOneAndUpdate(
                  { name: category },
                  { name: category },
                  { upsert: true }
                );

              } catch (err) {
                console.log(`err in adding categories: ${err}`);
              };
            };

            // push current categories to an array
            const categoriesIDs = [];
            for await (const category of categories) {
              try {
                const doc = await categoryModel.findOne({ name: category }).exec();
                const id = await doc._id;
                categoriesIDs.push(id);
              } catch (err) {
                console.log(`err in add categories' id to array: ${err}`);
              };
            };

            // create new restaurant in database if not exist
            await restaurantModel.findOneAndUpdate(
              // filter by yelp_id
              { yelp_id: restaurant.id },

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
                categories: [...categoriesIDs],
                rating: restaurantDetails.rating,
                price: restaurantDetails.price,
                photos: [...restaurantDetails.photos],
                main_photo_id: 0,
                opening_hours: [...restaurantDetails.hours[0].open],
              },

              // option: to upsert
              { upsert: true }
            );
          }, i * queryInterval);
        };

      };
      
      setTimeout(() => {
        console.log(`<---- seeding restaurants: DONE ---->`);
        console.log(`<---- go to "/seed-reviews" to complete seeding process ---->`);
      }, test.length * searchLimit * queryInterval)

    } catch(err) {
      console.log(`err in seeding restaurants: ${err}`);
    };

  },

  //FIXME: fix issue with seed reviews need to run separately after restaurants are seeded
  seedReviews: async () => {
    // get list of restaurants
    console.log(`reviews seeding started.....`);
    try {
      const restaurants = await restaurantModel.find({}, 'yelp_id _id').exec();
    
      restaurants.forEach(async (restaurant, i) => {

        setTimeout(async () => {
          const yelp_id = restaurant.yelp_id;
          const _id = restaurant._id;
          const reviews = await yelpApi.getReviews(yelp_id);

          reviews.forEach(async (review) => {
            await reviewModel.create({
              user_id: `yelp_${review.user_id}`,
              restaurant_id: _id,
              rating: review.rating,
              content: review.text,
              time_created: review.time_created,
              yelp_name: review.user.name,
              yelp_pic: review.user.image_url
            });
          });
        
        }, i * queryInterval);
      });

      setTimeout(()=> {
        console.log(`<---- seeding reviews: DONE ---->`);
      }, restaurants.length * 3 * queryInterval );
      

    } catch(err) {
      console.log(`error seeding reviews: ${err}`);
    }
    
  },

};

module.exports = seed;