const boardModel = require('../models/boards/board');
const userModel = require('../models/users/user')
const validator = require('../validators/boards');

const controller = {
  list: async (req, res) => {
    const username = req.params.username;
    let user = null;

    console.log(`username is ${username}`);

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
      res.render('boards/index', {board:[]});
      return;
    };
    
  },

  show: (req, res) => {

  },

  showCreateForm: (req, res) => {
    console.log(`request reached board controller`)
    const username = req.session.user;
    res.render('boards/create', {errMsg: null, username});
  },

  create: async (req, res) => {
    console.log(`submission from board create form: ${JSON.stringify(req.body)}`);
    const validationsResults = validator.create.validate(req.body);

    if (validationResults.error) {
      res.render(`boards/create`, {errMsg: `Please follow our requirements while filing in the form`});
      return;
    };

    const validatedResults = validationResults.value;

    try {
      const user = await userModel.findOne({username: req.params.username});
      const board = await boardModel.create({

      })
    } catch(err) {

    }
  },


};

module.exports = controller;