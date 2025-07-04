const express = require('express');
const router  = express.Router();
const {
  getReviews,
  submitReview
} = require('../controllers/reviewController');

// GET  /api/reviews
router.get('/reviews', getReviews);

// POST /api/reviews
router.post('/reviews', submitReview);

module.exports = router;
