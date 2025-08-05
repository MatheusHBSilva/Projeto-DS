const express = require('express');
const router  = express.Router();
const {idCookieRestaurant, validateGetTag, validateRegisterRestaurant, validateUpdateRestaurantTags} = require('../middlewares/restaurantMiddlewares');
const {
  registerRestaurant,
  getCurrentRestaurant,
  getRestaurants,
  getRestaurantTags,
  updateRestaurantTags
} = require('../controllers/restaurantController');

// POST   /api/register
router.post('/register', validateRegisterRestaurant, registerRestaurant);

// GET    /api/me
router.get('/me', idCookieRestaurant, getCurrentRestaurant);

// GET    /api/restaurants
router.get('/restaurants', getRestaurants);

// GET    /api/restaurant-tags
router.get('/restaurant-tags', validateGetTag, getRestaurantTags);

// POST   /api/update-restaurant-tags
router.post('/update-restaurant-tags', validateUpdateRestaurantTags, updateRestaurantTags);

module.exports = router;