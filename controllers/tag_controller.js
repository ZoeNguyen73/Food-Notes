const validator = require('../validators/tags');
const restaurantModel = require('../models/restaurants/restaurant');
const userModel = require('../models/users/user');
const tagModel = require('../models/tags/tag');

// for tag slug
const getSlug = require('speakingurl');

const controller = {
  showCreateForm: (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    res.render('tags/create', {errMsg: null, redirect});
  },

  create: async (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };

    const validationResults = validator.create.validate(req.body);

    if (validationResults.error) {
      res.render('tags/create', {errMsg: `Please follow our requirements while filing in the form`, redirect});
      return;
    };

    const tagName = validationResults.value.name;
    const username = req.session.user;

    // check if user already has a tag with the same name
    try {
      const user = await userModel.findOne({username}).exec();
      const user_id = user._id;
      const existingTag = await tagModel.findOne({user_id, name: tagName}).exec();

      if (existingTag) {
        res.render('tags/create', {errMsg: `There is already a tag with the same name`, redirect});
      return;
      };

      const tag = await tagModel.create({
        user_id,
        name: tagName,
        restaurants: []
      });

      if (redirect) {
        res.locals.redirect = null;
        res.redirect(`${redirect}`);
        return;
      };

      res.redirect(`/${username}/dashboard`);
      return;

    } catch(err) {
      console.log(`Error creating a new tag: ${err}`);
      res.render('pages/error', {errMsg: `An error occurred. Please try again`});
    };

  }
};

module.exports = controller;