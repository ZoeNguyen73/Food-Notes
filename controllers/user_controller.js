const bcrypt = require('bcrypt');

const userModel = require('../models/users/user');
const validator = require('../validators/users');

const controller = {

  showRegisterForm: (req, res) => {
    res.render('users/register', {errMsg:null});
  },

  register: async (req, res) => {
    console.log(`posted successfully`);
    console.log(`received form: ${JSON.stringify(req.body)}`);
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

      res.render('users/show', {user});
      return;

    } catch(err) {
      console.log(`Error creating a new users (register flow): ${err}`);
    };

    res.render('users/register',{errMsg:`Oops... Please try again with a different username/email`});
  },

  showLoginForm: (req, res) => {

  },

  login: (req, res) => {

  },

  show: async (req, res) => {
    let user = null;
    
    try {
      user = await userModel.findOne({username: req.session.username}).exec();
    } catch(err) {
      console.log(`Error getting user for show route: ${err}`);
    };
    
    res.render('users/show', {user});
  },
};

module.exports = controller;