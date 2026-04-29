/**
 * Automation Routes
 * API endpoints for managing automation flows
 */
const express = require('express');
const automationController = require('../controllers/automationController');
const { validateRequest, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// Get all automations for account
router.get('/', automationController.getAutomations);

// Get automation by ID
router.get('/:id', automationController.getAutomationById);

// Create new automation
router.post('/', validateRequest(schemas.automation), automationController.createAutomation);

// Update automation
router.patch('/:id', automationController.updateAutomation);

// Delete automation
router.delete('/:id', automationController.deleteAutomation);

// Activate automation
router.post('/:id/activate', automationController.activateAutomation);

// Deactivate automation
router.post('/:id/deactivate', automationController.deactivateAutomation);

// Test automation
router.post('/:id/test', automationController.testAutomation);

// Get execution history
router.get('/:id/history', automationController.getExecutionHistory);

// Get templates
router.get('/templates/list', automationController.getTemplates);

// Create from template
router.post('/templates/:templateKey/clone', automationController.createFromTemplate);

// Get automation stats
router.get('/stats/summary', automationController.getStats);

module.exports = router;
