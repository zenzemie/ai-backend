/**
 * Automation Controller
 * Handles HTTP requests for automation management
 */
const automationService = require('../services/automation/automationService');
const logger = require('../services/logger');

/**
 * Get all automations for the current account
 */
async function getAutomations(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const automations = await automationService.getAutomations(accountId);
    
    res.json({
      success: true,
      data: automations,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get automation by ID
 */
async function getAutomationById(req, res, next) {
  try {
    const { id } = req.params;
    const automation = await automationService.getAutomationById(id);
    
    res.json({
      success: true,
      data: automation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create new automation
 */
async function createAutomation(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { name, trigger, actions } = req.body;
    
    const automation = await automationService.createAutomation(accountId, {
      name,
      trigger,
      actions,
    });
    
    res.status(201).json({
      success: true,
      data: automation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update automation
 */
async function updateAutomation(req, res, next) {
  try {
    const { id } = req.params;
    const { name, trigger, actions, isActive } = req.body;
    
    const automation = await automationService.updateAutomation(id, {
      name,
      trigger,
      actions,
      isActive,
    });
    
    res.json({
      success: true,
      data: automation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete automation
 */
async function deleteAutomation(req, res, next) {
  try {
    const { id } = req.params;
    await automationService.deleteAutomation(id);
    
    res.json({
      success: true,
      message: 'Automation deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Activate automation
 */
async function activateAutomation(req, res, next) {
  try {
    const { id } = req.params;
    const automation = await automationService.activateAutomation(id);
    
    res.json({
      success: true,
      data: automation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate automation
 */
async function deactivateAutomation(req, res, next) {
  try {
    const { id } = req.params;
    const automation = await automationService.deactivateAutomation(id);
    
    res.json({
      success: true,
      data: automation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Test automation with sample data
 */
async function testAutomation(req, res, next) {
  try {
    const { id } = req.params;
    const testData = req.body; // Custom test data passed in body
    
    const result = await automationService.testAutomation(id, testData);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get execution history for automation
 */
async function getExecutionHistory(req, res, next) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const history = await automationService.getExecutionHistory(id, limit);
    
    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get available automation templates
 */
async function getTemplates(req, res, next) {
  try {
    const templates = automationService.TEMPLATES;
    const keys = automationService.getTemplateKeys();
    
    res.json({
      success: true,
      data: {
        keys,
        templates,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create automation from template
 */
async function createFromTemplate(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { templateKey } = req.params;
    
    const automation = await automationService.createFromTemplate(accountId, templateKey);
    
    res.status(201).json({
      success: true,
      data: automation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get automation statistics
 */
async function getStats(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const stats = await automationService.getAutomationStats(accountId);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  activateAutomation,
  deactivateAutomation,
  testAutomation,
  getExecutionHistory,
  getTemplates,
  createFromTemplate,
  getStats,
};
