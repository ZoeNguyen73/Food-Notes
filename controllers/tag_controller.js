const validator = require('../validators/tags');
const restaurantModel = require('../models/restaurants/restaurant');
const userModel = require('../models/users/user');
const tagModel = require('../models/tags/tag');

// for tag slug
const getSlug = require('speakingurl');
const { createIndexes } = require('../models/users/user');

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
        restaurants: [],
        slug: getSlug(tagName)
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

  },

  update: async (req, res) => {
    let redirect = req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    const queries = req.body;
    const tagSlugs = Object.keys(queries);

    const username = req.session.user;
    const restaurantSlug = req.params.restaurant_slug;

    try {
      const user = await userModel.findOne({username}).exec();
      const user_id = user._id;
      const restaurant = await restaurantModel.findOne({slug: restaurantSlug}).exec();
      const restaurantID = restaurant._id;
      const userTags = await tagModel.find({user_id}).exec();

      if (tagSlugs.length === 0) {
        for await (const tag of userTags) {
          const slug = tag.slug;
          if (tag.restaurants.includes(restaurantID)) {
            await tagModel.updateOne({user_id, slug}, {$pull: {restaurants: restaurantID}});
          };
        };
      } else {
        for await (const tag of userTags) {
          const slug = tag.slug;
          if (tagSlugs.includes(slug) && (!tag.restaurants.includes(restaurantID))) {
            await tagModel.findOneAndUpdate({user_id, slug}, {$push: {restaurants: restaurantID}});
          } else if ((!tagSlugs.includes(slug)) && tag.restaurants.includes(restaurantID)) {
            await tagModel.updateOne({user_id, slug}, {$pull: {restaurants: restaurantID}});
          };
        };
      };

    } catch(err) {
      console.log(`Error updating tags: ${err}`);
      res.render('pages/error', {errMsg: `An error occurred. Please try again`});
    }

    res.redirect(redirect);
  }
};

module.exports = controller;