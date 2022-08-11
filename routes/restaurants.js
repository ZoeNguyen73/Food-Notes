const router = require('express').Router();
const restaurantController = require('../controllers/restaurant_controller');

const userAuth = require('../middlewares/user_auth');
const filtersValidator = require('../middlewares/restaurants_filter');

// index action
router.get('/', filtersValidator.verify, restaurantController.list);

// show action
router.get('/:restaurant_slug', restaurantController.show);

// pin to board
router.put('/:restaurant_slug/:username/pin', userAuth.isAuthenticated, userAuth.isAuthorised, restaurantController.addToBoard);

// remove from board
router.put('/:restaurant_slug/:username/remove', userAuth.isAuthenticated, userAuth.isAuthorised, restaurantController.removeFromBoard);

module.exports = router;