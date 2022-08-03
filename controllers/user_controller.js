const bcrypt = require('bcrypt');

const userModel = require('../models/users/user');
const validator = require('../validators/users');

const controller = {

  showRegisterForm: (req, res) => {
    res.render('users/register', {errMsg:null});
  },

  register: async (req, res) => {
    const validationResults = validator.register.validate(req.body);

    if (validationResults.error) {
      res.render('users/register', {errMsg:`Please follow our requirements while filing in the form`});
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

      res.render('users/profile', {user});
      return;

    } catch(err) {
      console.log(`Error creating a new users (register flow): ${err}`);
    };

    res.render('users/register',{errMsg:`Oops... Please try again with a different username/email`});
  },

  showLoginForm: (req, res) => {
    res.render('users/login', {errMsg:null});
  },

  login: async (req, res) => {
    console.log(`login request body: ${JSON.stringify(req.body)}`);
    const validationResults = validator.login.validate(req.body);

    if (validationResults.error) {
      res.render('users/login', {errMsg:`Please try again`});
      return;
    };

    const validatedResults = validationResults.value;
    console.log(`validatedResults: ${JSON.stringify(validatedResults)}`);
    let user = null;

    try {
      user = await userModel.findOne({username: validatedResults.username});
    } catch (err) {
      res.render('users/login', {errMsg:`User not found. Please try again!`});
      return;
    };

    if (!user) {
      res.render('users/login', {errMsg:`User not found. Please try again!`});
      return;
    };

    const passwordMatches = await bcrypt.compare(validatedResults.password, user.hashed_password);

    if (!passwordMatches) {
      res.render('users/login', {errMsg:`Authentication failed. Please try again!`});
      return;
    };

    // log the user in by creating a session
    req.session.regenerate(function (err) {
      if (err) {
        res.render('users/login', {errMsg:`Authentication failed. Please try again!`});
        return;
      };
  
      // store user information in session, typically a user id
      req.session.user = user.username;
  
      // save the session before redirection to ensure page
      // load does not happen before session is saved
      req.session.save(function (err) {
        if (err) {
          res.render('users/login', {errMsg:`Authentication failed. Please try again!`});
          return;
        };

        res.redirect(`/users/${user.username}`);
      })
    })

  },

  showProfile: async (req, res) => {
    let user = null;

    try {
      user = await userModel.findOne({username: req.session.username}).exec();
      
    } catch(err) {
      console.log(`Error getting user for show route: ${err}`);
    };
    
    res.render('users/profile', {user});
  },
};

module.exports = controller;