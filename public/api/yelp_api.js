const searchUrl = 'https://api.yelp.com/v3/businesses/search?categories=restaurants';
const detailsUrl = 'https://api.yelp.com/v3/businesses/';
const options = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${process.env.YELP_API_KEY}`,
  }
};
const searchLimit = 10;

const yelpApi = {
  searchRestaurants: async (lat, long) => {
    const url = `${searchUrl}&limit=${searchLimit}&latitude=${lat}&longitude=${long}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  },

  getRestaurantDetails: async (id) => {
    const url = `${detailsUrl}${id}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  },

  getReviews: async (id) => {
    const url = `${detailsUrl}${id}/reviews`;
    const response = await fetch(url, options);
    const data = await response.json();
    return data.reviews;
  }
};

module.exports = yelpApi;