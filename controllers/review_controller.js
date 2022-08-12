const validator = require('../validators/reviews');
const restaurantModel = require('../models/restaurants/restaurant');
const userModel = require('../models/users/user');
const reviewModel = require('../models/reviews/review');

const controller = {
  create: async (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    const endIdx = req.originalUrl.indexOf('/', 13); 
    const restaurant_slug = req.originalUrl.substring(13, endIdx);
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    
    const validationResults = validator.create.validate(req.body);

    if (validationResults.error) {
      res.render('pages/error', {errMsg: `An error occured. Please try again`});
      return;
    };

    const validatedResults = validationResults.value;

    const username = req.params.username;
    const restaurantSlug = restaurant_slug;

    try {
      const user = await userModel.findOne({username}).exec();
      const user_id = user._id;
      const restaurant = await restaurantModel.findOne({slug: restaurantSlug}).exec();
      const restaurant_id = restaurant._id;

      // get today day
      const today = new Date();
      const year = today.getFullYear();
      const month = `${today.getMonth() + 1}`;
      const date = `${today.getDate().toLocaleString('sg-SG')}`;
      const hours = `${today.getHours().toLocaleString('sg-SG')}`;
      const minutes = `${today.getMinutes().toLocaleString('sg-SG')}`;
      const seconds = `${today.getSeconds().toLocaleString('sg-SG')}`;

      const timeStr = `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;

      const review = await reviewModel.create({
        user_id,
        restaurant_id,
        rating: validatedResults.rating,
        content: validatedResults.content,
        time_created: timeStr
      });

      res.redirect(`/restaurants/${restaurantSlug}`);
      return;

    } catch(err) {
      console.log(`Error creating new review ${err}`);
      res.render('pages/error', {errMsg: `An error occured. Please try again`});
      return;
    };

  }
};

module.exports = controller;