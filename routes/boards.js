const router = require('express').Router({mergeParams: true});
const controller = require('../controllers/board_controller');
const userAuth = require('../middlewares/user_auth');

// all boards
router.get('/', controller.list);

// create form
router.get('/create', userAuth.isAuthenticated, userAuth.isAuthorised, controller.showCreateForm);

// create new board
router.post('/create', userAuth.isAuthenticated, userAuth.isAuthorised, controller.create);

// show board
router.get('/:board_slug', controller.show);

module.exports = router;