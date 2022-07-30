const searchUrl = 'https://api.yelp.com/v3/businesses/search';
const detailsUrl = 'https://api.yelp.com/v3/businesses/';
const options = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${process.env.YELP_API_KEY}`,
  }
};

const yelpApi = {
  searchRestaurants: async (lat, long) => {
    const url = `${searchUrl}?categories=restaurants&limit=50&latitude=${lat}&longitude=${long}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  },

  getRestaurantDetails: async (id) => {
    const url = `${detailsUrl}${id}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  }
};

module.exports = yelpApi;