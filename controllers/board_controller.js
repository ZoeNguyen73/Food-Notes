const boardModel = require('../models/boards/board');
const neighborhoodModel = require('../models/neighborhoods/neighborhood');
const restaurantModel = require('../models/restaurants/restaurant');
const userModel = require('../models/users/user')
const validator = require('../validators/boards');

// for board slug
const getSlug = require('speakingurl');

const controller = {
  list: async (req, res) => {
    const username = req.params.username;
    let user = null;

    // get userID
    try {
      user = await userModel.findOne({username}).exec();
    } catch(err) {
      console.log(`Error finding username: ${err}`);
      res.render('boards/index', {board:[]});
      return;
    };
    
    const user_id = user._id;
    try {
      const boards = await boardModel.find({user_id}).exec();
      res.render('boards/index',{boards});
    } catch(err) {
      console.log(`Error finding boards under username ${username}: ${err}`);
      res.render('boards/index', {board: [], errMsg: `Oops, we could not find any boards`});
      return;
    };
    
  },

  show: async (req, res) => {
    const slug = req.params.board_slug;
    const username = req.params.username;
    const redirect = req.originalUrl;
    let board = null;
    let errMsg = null;
    let restaurants = null;
    let neighborhoods = null;
    let categories = null;
    let reviews = null;
    let day = null
 
    try {
      board = await boardModel.findOne({username, slug}).exec();

      if (!board.is_public && req.session.user !== username) {
        errMsg = `Opps, this board is private`;
      };

      [restaurants, neighborhoods, categories, reviews, day, boards] 
      = await restaurantModel.getDataForList(username, {board_slug: [slug]});

    } catch(err) {
      console.log(`Error finding board: ${err}`);
      errMsg = 'Oops, the board cannot be found';
    };

    res.render('boards/show', {board, username, errMsg, restaurants, neighborhoods, categories, reviews, day, redirect});
  },

  showCreateForm: (req, res) => {
    res.render('boards/create', {errMsg: null});
  },

  create: async (req, res) => {
    const username = req.params.username;
    const validationResults = validator.create.validate(req.body);

    if (validationResults.error) {
      res.render('boards/create', {errMsg: `Please follow our requirements while filing in the form`, username});
      return;
    };

    const validatedResults = validationResults.value;

    // check if user already has a board with the same name
    const user = await userModel.findOne({username}).exec();
    const existingBoard = await boardModel.findOne({user_id: user._id, name: validatedResults.name}).exec();

    if (existingBoard) {
      res.render('boards/create', {errMsg: `There is already a board with the same name`, username});
      return;
    };

    try {
      const board = await boardModel.create({
        user_id: user._id,
        name: validatedResults.name,
        description: validatedResults.description,
        is_public: validatedResults.public_setting === '1',
        slug: getSlug(validatedResults.name)
      });

      res.redirect(`/${username}/boards/${board.slug}`);
      return;

    } catch(err) {
      console.log(`Error creating new board: ${err}`);
      res.render('boards/create', {errMsg: 'Sorry, please try again', username});
      return;
    };
  },

  showEditForm: async (req, res) => {
    const slug = req.params.board_slug;
    const username = req.params.username;
    let board = null;
    let errMsg = null;
    try {
      board = await boardModel.findOne({username, slug}).exec();
    } catch(err) {
      console.log(`Error getting board: ${err}`);
      errMsg = 'Some issues occurred. Please try again';
    };
    res.render('boards/edit', {board, errMsg});
  },

  edit: async (req, res) => {
    let slug = req.params.board_slug;
    const username = req.params.username;
    
    try {
      // validate that board exists
      const board = await boardModel.findOne({username, slug}).exec();

      if (!board) {
        res.render('pages/error', {errMsg: "Board cannot be found." });
        return;
      };

      // validate that input meets the requirement
      const validationResults = validator.edit.validate(req.body);

      if (validationResults.error) {
        res.render('boards/edit', {board, errMsg: `Please follow our requirements while filing in the form`});
        return;
      };
  
      const validatedResults = validationResults.value;

      // check if user already has a board with the same name
      const user = await userModel.findOne({username}).exec();
      const existingBoard = await boardModel.findOne({user_id: user._id, name: validatedResults.name}).exec();

      if (existingBoard) {
        res.render('boards/edit', {board, errMsg: `There is already a board with the same name`});
        return;
      };

      const updatedBoard = await boardModel.findOneAndUpdate(
        {username, slug},
        {
          name: validatedResults.name,
          description: validatedResults.description,
          is_public: validatedResults.public_setting === '1',
          slug: getSlug(validatedResults.name)
        },
        {new: true}
      );

      slug = updatedBoard.slug;

    } catch(err) {
      console.log(`Error editing board: ${err}`);
    };

    res.redirect(`/${username}/boards/${slug}`);
  },

};

module.exports = controller;