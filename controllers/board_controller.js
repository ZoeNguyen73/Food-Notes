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
    let imgUrls = [];
    let errMsg = null;
    let boards = null;

    // get userID
    try {
      const user = await userModel.findOne({username}).exec();
      
      if (!user) {
        res.render('pages/error', {errMsg: "User cannot be found." });
        return;
      };

      const user_id = user._id;
      boards = await boardModel.find({user_id}).exec();

      // get first restaurant img 
      for await (const board of boards) {
        let imgUrl = null;
        if (board.restaurants.length === 0) {
          imgUrl = '/img/placeholder-restaurant.jpg';
        } else {
          const restaurant = await restaurantModel.findOne({_id: board.restaurants[0]}).exec();
          imgUrl = restaurant.photos[restaurant.main_photo_id];
        };
        imgUrls.push(imgUrl);
      };
      
    } catch(err) {
      console.log(`Error finding boards: ${err}`);
      errMsg = 'Oops, we could not find any boards';
    };

    res.render('boards/index',{boards, username, imgUrls, errMsg});
  },

  show: async (req, res) => {
    res.locals.page = 'board-show';
    const slug = req.params.board_slug;
    const username = req.params.username;
    const redirect = req.originalUrl;
    const currentUser = req.session.user || null;
    let board = null;
    let errMsg = null;
    let restaurants = null;
    let neighborhoods = null;
    let categories = null;
    let reviews = null;
    let day = null;
    const { page = 1, limit = 36 } = req.query;
    let totalPages = 1;
 
    try {
      board = await boardModel.findOne({username, slug}).exec();

      if (!board.is_public && currentUser !== username) {
        errMsg = `Opps, this board is private`;
      };

      [restaurants, neighborhoods, categories, reviews, day, boards, totalPages] 
      = await restaurantModel.getDataForList(currentUser, {board_slug: [slug]}, page, limit);

    } catch(err) {
      console.log(`Error finding board: ${err}`);
      errMsg = 'Oops, the board cannot be found';
    };

    res.render('boards/show', {
      board, 
      username, 
      errMsg, 
      restaurants, 
      neighborhoods, 
      categories, 
      reviews, 
      day, 
      redirect,
      totalPages,
      currentPage: page,
      pageUrl: `${req.baseUrl}${req.path}`
    });
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
      if (board.name !== validatedResults.name) {
        const user = await userModel.findOne({username}).exec();
        const existingBoard = await boardModel.findOne({user_id: user._id, name: validatedResults.name}).exec();

        if (existingBoard) {
          res.render('boards/edit', {board, errMsg: `There is already a board with the same name`});
          return;
        };
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

  delete: async (req, res) => {
    const slug = req.params.board_slug;
    const username = req.params.username;

    try {
      // validate that board exists
      const board = await boardModel.findOne({username, slug}).exec();

      if (!board) {
        res.render('pages/error', {errMsg: "Board cannot be found." });
        return;
      };

      await boardModel.findOneAndDelete({username, slug});

    } catch(err) {
      console.log(`Error deleting board: ${err}`);
    };

    res.redirect(`/${username}/boards`);
  }

};

module.exports = controller;