const router = require('express').Router();
const userController = require('../controllers/user_controller');
const userAuth = require('../middlewares/user_auth');


// register
router.get('/register', userController.showRegisterForm);

// create new account
router.post('/register', userController.register);

// log in form
router.get('/login', userController.showLoginForm);

// log in
router.post('/register', userController.login);

// show-profile action
router.get('/:username', userController.show);

module.exports = router;