const express = require('express');
const router = express.Router();
const { businessAnalysis } = require('../controllers/analysisController');

// POST /api/business-analysis
router.post('/business-analysis', businessAnalysis);

module.exports = router;
