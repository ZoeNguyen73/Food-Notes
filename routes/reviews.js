const router = require('express').Router();
const userAuth = require('../middlewares/user_auth');
const controller = require('../controllers/review_controller');

// add a review
router.post('/:username/create', userAuth.isAuthenticated, controller.create);

module.exports = router;