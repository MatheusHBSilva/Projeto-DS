const express = require('express');
const router  = express.Router();
const {
  getFavoriteIds,
  toggleFavorite,
  getFavoriteRestaurants
} = require('../controllers/favoriteController');

// GET  /api/favorites
router.get('/favorites', getFavoriteIds);

// POST /api/favorites
router.post('/favorites', toggleFavorite);

// GET  /api/favorites/restaurants
router.get('/favorites/restaurants', getFavoriteRestaurants);

module.exports = router;
