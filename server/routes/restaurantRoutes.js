const express = require('express');
const router  = express.Router();
const {
  registerRestaurant,
  getCurrentRestaurant,
  getRestaurants,
  getRestaurantTags
} = require('../controllers/restaurantController');

// POST   /api/register
router.post('/register', registerRestaurant);

// GET    /api/me
router.get('/me', getCurrentRestaurant);

// GET    /api/restaurants
router.get('/restaurants', getRestaurants);

// GET    /api/restaurant-tags
router.get('/restaurant-tags', getRestaurantTags);



module.exports = router;
