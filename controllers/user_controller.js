const bcrypt = require('bcrypt');

const userModel = require('../models/users/user');
const validator = require('../validators/users');

const controller = {

  showRegisterForm: (req, res) => {
    res.render('users/register', {errMsg: null, redirect: req.query.redirect});
  },

  register: async (req, res) => {
    const redirect = req.query.redirect || null;
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
            res.redirect(`/${redirect}`);
            return;
          };

          res.redirect(`/users/${user.username}`);
          return;
        });
      });
    } catch(err) {
      console.log(`Error creating a new users (register flow): ${err}`);
    };
  },

  showLoginForm: (req, res) => {
    res.render('users/login', {errMsg: null, redirect: req.query.redirect});
  },

  login: async (req, res) => {

    const redirect = req.query.redirect || null;
    const validationResults = validator.login.validate(req.body);

    if (validationResults.error) {
      res.render('users/login', {errMsg:`Please try again`});
      return;
    };

    const validatedResults = validationResults.value;
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

        if (redirect) {
          res.redirect(`/${redirect}`);
          return
        };
        res.redirect(`/users/${user.username}`);
      })
    });

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

  logout: async (req, res) => {
    req.session.user = null;

    req.session.save(function (err) {
      if (err) {
        res.redirect('/users/login')
        return
      };

      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session.regenerate(function (err) {
        if (err) {
          res.redirect('/users/login')
          return
        };
                
        res.redirect('/restaurants');
      });
    });
  },
};

module.exports = controller;