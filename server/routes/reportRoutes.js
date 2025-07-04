const express = require('express');
const router = express.Router();
const {
  getReportHistory,
  downloadReport
} = require('../controllers/reportController');

// GET  /api/report-history
router.get('/report-history', getReportHistory);

// POST /api/download-report
router.post('/download-report', downloadReport);

module.exports = router;
