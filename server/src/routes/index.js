const express = require('express');
const leadRoutes = require('./leads');
const outreachRoutes = require('./outreach');
const analyticsRoutes = require('./analytics');
const automationRoutes = require('./automation');
const reputationRoutes = require('./reputation');
const websiteRoutes = require('./websiteRoutes');
const receptionistRoutes = require('./receptionist');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (NO AUTH)
router.use('/websites/public', require('./websiteRoutesPublic'));
router.use('/receptionist/public', require('./receptionistPublic'));

// Apply auth middleware to protected routes
router.use(authMiddleware);

router.use('/leads', leadRoutes);
router.use('/outreach', outreachRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/automations', automationRoutes);
router.use('/reputation', reputationRoutes);
router.use('/websites', websiteRoutes);
router.use('/receptionist', receptionistRoutes);

module.exports = router;
