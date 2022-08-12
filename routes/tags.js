const router = require('express').Router();
const userAuth = require('../middlewares/user_auth');
const controller = require('../controllers/tag_controller');

// show tag creation form
router.get('/create', userAuth.isAuthenticated, controller.showCreateForm);

// create a new tag
router.post('/create', userAuth.isAuthenticated, controller.create);

// add restaurant to a tag
router.put('/:username/add-tag', userAuth.isAuthenticated, controller.create);

// remove restaurant from a tag
router.put('/:username/remove-tag', userAuth.isAuthenticated, controller.create);

module.exports = router;