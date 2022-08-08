const boardModel = require('../models/boards/board');
const neighborhoodModel = require('../models/neighborhoods/neighborhood');
const restaurantModel = require('../models/restaurants/restaurant');
const userModel = require('../models/users/user')
const validator = require('../validators/boards');

const controller = {
  list: async (req, res) => {
    const username = req.params.username;
    let user = null;

    // get userID
    try {
      user = await userModel.findOne({username});
    } catch(err) {
      console.log(`Error finding username: ${err}`);
      res.render('boards/index', {board:[]});
      return;
    };
    
    const user_id = user._id;
    try {
      const boards = await boardModel.find({user_id});
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
    let board = null;
    let errMsg = null;
    let restaurants = null;
    let neighborhoods = null;
    let categories = null;
    let reviews = null;
    let day = null
 
    try {
      board = await boardModel.findOne({username, slug});

      if (!board.is_public && req.session.user !== username) {
        errMsg = `Opps, this board is private`;
      };

      [restaurants, neighborhoods, categories, reviews, day, boards] 
      = await restaurantModel.getDataForList(username, {board_slug: [slug]});

    } catch(err) {
      console.log(`Error finding board: ${err}`);
      errMsg = `Oops, the board cannot be found`;
    };

    res.render('boards/show', {board, username, errMsg, restaurants, neighborhoods, categories, reviews, day});
  },

  showCreateForm: (req, res) => {
    const username = req.session.user;
    res.render('boards/create', {errMsg: null, username});
  },

  create: async (req, res) => {
    const username = req.params.username;
    const validationResults = validator.create.validate(req.body);

    if (validationResults.error) {
      res.render(`boards/create`, {errMsg: `Please follow our requirements while filing in the form`, username});
      return;
    };

    const validatedResults = validationResults.value;

    // check if user already has a board with the same name
    const user = await userModel.findOne({username});
    const existingBoard = await boardModel.findOne({user_id: user._id, name: validatedResults.name});

    if (existingBoard) {
      res.render(`boards/create`, {errMsg: `There is already a board with the same name`, username});
      return;
    };

    try {
      const board = await boardModel.create({
        user_id: user._id,
        name: validatedResults.name,
        description: validatedResults.description,
        is_public: validatedResults.public_setting === '1',
      });

      res.redirect(`/${username}/boards/${board.slug}`);
      return;

    } catch(err) {
      console.log(`Error creating new board: ${err}`);
      res.render('boards/create', {errMsg: 'Sorry, please try again', username});
      return;
    };
  },

  addRestaurant: (req, res) => {

  },

  removeRestaurant: (req, res) => {

  }

};

module.exports = controller;