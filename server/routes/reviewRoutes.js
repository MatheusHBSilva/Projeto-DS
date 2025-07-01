const express = require('express');
const router  = express.Router();
const { getReviews } = require('../controllers/reviewController');

// GET /api/reviews
router.get('/reviews', getReviews);

module.exports = router;
