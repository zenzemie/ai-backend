const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

// Public route for viewing a website by slug
router.get('/:slug', websiteController.getWebsiteBySlug);

module.exports = router;
