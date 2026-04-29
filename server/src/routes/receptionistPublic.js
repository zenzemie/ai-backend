const express = require('express');
const router = express.Router();
const receptionistController = require('../controllers/receptionistController');

/**
 * Public Webhook for Vapi
 */
router.post('/vapi', receptionistController.handleVapiWebhook);

module.exports = router;
