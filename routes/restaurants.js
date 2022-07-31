const router = require('express').Router();
const restaurantController = require('../controllers/restaurant_controller');

// index action
router.get('/', restaurantController.list);

// show action
router.get('/:restaurant_slug', restaurantController.show);

module.exports = router;