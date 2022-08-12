const router = require('express').Router({mergeParams: true});
const controller = require('../controllers/board_controller');
const userAuth = require('../middlewares/user_auth');
const filtersValidator = require('../middlewares/restaurants_filter');

// all boards
router.get('/', controller.list);

// create form
router.get('/create', userAuth.isAuthenticated, userAuth.isAuthorised, controller.showCreateForm);

// create new board
router.post('/create', userAuth.isAuthenticated, userAuth.isAuthorised, controller.create);

// show edit form
router.get('/:board_slug/edit', userAuth.isAuthenticated, userAuth.isAuthorised, controller.showEditForm);

// edit a board
router.put('/:board_slug/edit', userAuth.isAuthenticated, userAuth.isAuthorised, controller.edit);

// delete a board
router.delete('/:board_slug/delete', userAuth.isAuthenticated, userAuth.isAuthorised, controller.delete);

// show board
router.get('/:board_slug', filtersValidator.verify, controller.show);

module.exports = router;