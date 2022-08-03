const router = require('express').Router({mergeParams: true});
const controller = require('../controllers/board_controller');
const userAuth = require('../middlewares/user_auth');

// all boards
router.get('/', controller.list);

// create form
router.get('/create', controller.showCreateForm);

// create new board
router.post('/create', userAuth.isAuthenticated, controller.create);

// show board
router.get('/:boardName', controller.show);

module.exports = router;