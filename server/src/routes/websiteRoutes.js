const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

// All routes here are protected by the auth middleware in routes/index.js

router.post('/', websiteController.createWebsite);
router.get('/', websiteController.getWebsites);
router.get('/:id', websiteController.getWebsiteById);
router.put('/:id', websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);
router.post('/generate', websiteController.generateWebsite);

module.exports = router;
