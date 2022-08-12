const router = require('express').Router();
const controller = require('../controllers/user_controller');
const pageController = require('../controllers/page_controller');
const userAuth = require('../middlewares/user_auth');
const boardRouter = require('./boards');


// register
router.get('/register', controller.showRegisterForm);

// create new account
router.post('/register', controller.register);

// log in form
router.get('/login', controller.showLoginForm);

// log in
router.post('/login', controller.login);

// logout
router.post('/logout', controller.logout);

// show-profile action - will be visbile to other users
router.get('/:username', controller.show);

// show dashboard
router.get('/:username/dashboard', userAuth.isAuthenticated, userAuth.isAuthorised, controller.showDashboard);

// use board router
router.use('/:username/boards', boardRouter);

// homepage
router.get('/', pageController.loadHomePage);


module.exports = router;