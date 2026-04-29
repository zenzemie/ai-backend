const express = require('express');
const router = express.Router();
const receptionistController = require('../controllers/receptionistController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Protected Routes
 */
router.get('/:receptionistId/logs', authMiddleware, receptionistController.getCallLogs);
router.get('/logs/:id', authMiddleware, receptionistController.getCallLogDetail);
router.post('/config', authMiddleware, receptionistController.upsertReceptionist);

module.exports = router;
