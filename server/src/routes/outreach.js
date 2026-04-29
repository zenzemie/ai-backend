const express = require('express');
const outreachController = require('../controllers/outreachController');
const { heavyTaskLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRequest, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/generate', validateRequest(schemas.generateOutreach), outreachController.generatePitch);
// Fix: Renamed to match frontend api call 'send-email'
router.post('/send-email', heavyTaskLimiter, validateRequest(schemas.sendEmail), outreachController.sendEmailOutreach);

module.exports = router;
