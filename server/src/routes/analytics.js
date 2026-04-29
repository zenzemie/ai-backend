const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/stats', analyticsController.getSystemStats);
router.get('/industries', analyticsController.getIndustryInsights);
router.get('/roi', analyticsController.getROIMetrics);

module.exports = router;
