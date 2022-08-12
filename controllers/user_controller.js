const bcrypt = require('bcrypt');

const userModel = require('../models/users/user');
const boardModel = require('../models/boards/board');
const restaurantModel = require('../models/restaurants/restaurant');
const validator = require('../validators/users');

const controller = {

  showRegisterForm: (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    res.render('users/register', {errMsg: null, redirect});
  },

  register: async (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    const validationResults = validator.register.validate(req.body);

    if (validationResults.error) {
      res.render('users/register', {errMsg: `Please follow our requirements while filing in the form`, redirect});
      return;
    };

    const validatedResults = validationResults.value;

    const hash = await bcrypt.hash(validatedResults.password, 10);

    try {
      const user = await userModel.create({
        username: validatedResults.username,
        email_address: validatedResults.email_address,
        hashed_password: hash
      });

      // log the user in by creating a session
      req.session.regenerate(function (err) {
        if (err) {
          console.log(`error generating session after registration: ${err}`);
          res.render('users/login', {errMsg:`Authentication failed. Please try again!`, redirect});
          return;
        };
  
        // store user information in session, typically a user id
        req.session.user = user.username;
  
        // save the session before redirection to ensure page
        // load does not happen before session is saved
        req.session.save(function (err) {
          if (err) {
            console.log(`error saving session after registration: ${err}`);
            res.render('users/login', {errMsg:`Authentication failed. Please try again!`, redirect});
            return;
          };

          if (redirect) {
            res.locals.redirect = null;
            res.redirect(`${redirect}`);
            return;
          };

          res.redirect(`/${user.username}/dashboard`);
          return;
        });
      });
    } catch(err) {
      console.log(`Error creating a new users (register flow): ${err}`);
    };
  },

  showLoginForm: (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    res.render('users/login', {errMsg: null, redirect});
  },

  login: async (req, res) => {
    let redirect = res.locals.redirect || req.query.redirect || null;
    if (redirect) {
      redirect = redirect.replace(/ /g, '%20').replace(/\+/g, '%2B');
    };
    
    const validationResults = validator.login.validate(req.body);

    if (validationResults.error) {
      res.render('users/login', {errMsg:`Please try again`, redirect});
      return;
    };

    const validatedResults = validationResults.value;
    let user = null;

    try {
      user = await userModel.findOne({username: validatedResults.username});
    } catch (err) {
      res.render('users/login', {errMsg:`User not found. Please try again!`, redirect});
      return;
    };

    if (!user) {
      res.render('users/login', {errMsg:`User not found. Please try again!`, redirect});
      return;
    };

    const passwordMatches = await bcrypt.compare(validatedResults.password, user.hashed_password);

    if (!passwordMatches) {
      res.render('users/login', {errMsg:`Authentication failed. Please try again!`, redirect});
      return;
    };

    // log the user in by creating a session
    req.session.regenerate(function (err) {
      if (err) {
        res.render('users/login', {errMsg:`Authentication failed. Please try again!`, redirect});
        return;
      };
  
      // store user information in session, typically a user id
      req.session.user = user.username;
  
      // save the session before redirection to ensure page
      // load does not happen before session is saved
      req.session.save(function (err) {
        if (err) {
          res.render('users/login', {errMsg:`Authentication failed. Please try again!`, redirect});
          return;
        };

        if (redirect) {
          res.locals.redirect = null;
          res.redirect(`${redirect}`);
          return
        };
        res.redirect(`/${user.username}/dashboard`);
      })
    });

  },

  showDashboard: async (req, res) => {
    let user = null;
    let boardsCount  = null;
    let restaurantsCount = null;

    try {
      user = await userModel.findOne({username: req.session.user}).exec();

      const boards = await boardModel.find({user_id: user._id});
      boardsCount = boards.length;

      // get first 3 boards
      const topBoards = boards.slice(0,3);

      // get first 4 restaurants for each board
      const restaurantsArr = [];
      for await (const board of boards) {
        const restaurantIDs = board.restaurants;
        restaurantIDs.forEach(id => {
          if (!restaurantsArr.includes(id)) {
            restaurantsArr.push(id);
          };
        });
      };

      restaurantsCount = restaurantsArr.length;

      res.render('users/dashboard', {user, boards: topBoards, boardsCount, restaurantsCount});

      return;

    } catch(err) {
      console.log(`Error getting user for show route: ${err}`);
    };
    
    res.render('users/login', {errMsg:`User not found. Please try again!`, redirect: null});
  },

  logout: async (req, res) => {
    req.session.user = null;

    req.session.save(function (err) {
      if (err) {
        res.render('users/login', {errMsg:`Please try again`, redirect: null});
        return
      };

      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session.regenerate(function (err) {
        if (err) {
          res.render('users/login', {errMsg:`Please try again`, redirect: null});
          return
        };
                
        res.redirect('/restaurants');
      });
    });
  },

  show: async (req, res) => {
    
  }
};

module.exports = controller;