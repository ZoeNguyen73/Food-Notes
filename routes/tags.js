const router = require('express').Router();
const userAuth = require('../middlewares/user_auth');
const controller = require('../controllers/tag_controller');

// show tag creation form
router.get('/create', userAuth.isAuthenticated, controller.showCreateForm);

// create a new tag
router.post('/create', userAuth.isAuthenticated, controller.create);

// update a restaurant's tags
router.put('/:restaurant_slug/update', userAuth.isAuthenticated, controller.update);

module.exports = router;