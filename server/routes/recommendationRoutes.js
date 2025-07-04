const express = require('express');
const router = express.Router();
const { clientRecommendation } = require('../controllers/recommendationController');

// POST /api/client-recommendation
router.post('/client-recommendation', clientRecommendation);

module.exports = router;
