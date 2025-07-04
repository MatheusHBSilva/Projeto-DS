const express = require('express');
const router = express.Router();
const { registerClient, getCurrentClient } = require('../controllers/clientController');

// POST /api/register-client
router.post('/register-client', registerClient);

// GET /api/client-me
router.get('/client-me',      getCurrentClient);

module.exports = router;
