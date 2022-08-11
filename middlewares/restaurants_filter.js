const filterList = require('../models/filter_list');

const restaurantsFilters = {
  verify: (req, res, next) => {
    if (Object.keys(req.query).length === 0) {
      next();
      return;
    };

    const originalUrl = `${req.baseUrl}${req.url.substring(1)}`;
    let url = `${req.baseUrl}${ req.path !== '/' ? req.path : ''}?`;

    const queries = req.query;
    const keys = Object.keys(queries);

    keys.forEach((key, idx) => {
      if (filterList.restaurants.includes(key)) {
        const currentData = queries[key].split('+');
        const currentValues = [];
        if (currentData.length > 0) {
          currentData.forEach(d => {
            if (currentData.filter(n => n === d).length === 1) {
              currentValues.push(d);
            };
          });
        };
        
        if (currentValues.length > 0) {
          url += `${key}=${currentValues.join('%2B').replace(/ /g, '%20')}${(idx === keys.length - 1) ? '' : '&'}`;
        }; 
      };
    });

    if (originalUrl === url) {
      next();
      return;
    };

    res.redirect(url);
    return;

  },
};

module.exports = restaurantsFilters;