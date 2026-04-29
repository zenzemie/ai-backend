/**
 * Automation Service
 * High-level API for managing automation flows
 */
const logger = require('../logger');
const prisma = require('../../config/prisma');
const { TRIGGER_TYPES } = require('./triggerService');
const triggerService = require('./triggerService');

/**
 * Create a new automation flow
 */
async function createAutomation(accountId, data) {
  const { name, trigger, actions } = data;
  
  // Validate trigger structure
  if (!trigger || !trigger.type) {
    throw new Error('Invalid trigger: must have a type');
  }
  
  // Validate actions array
  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    throw new Error('Invalid actions: must be a non-empty array');
  }
  
  const automation = await prisma.automation.create({
    data: {
      name,
      trigger,
      actions,
      accountId,
    },
  });
  
  logger.info(`Automation created: ${name}`, { automationId: automation.id });
  
  return automation;
}

/**
 * Update an existing automation
 */
async function updateAutomation(automationId, data) {
  const automation = await prisma.automation.update({
    where: { id: automationId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
  
  logger.info(`Automation updated: ${automation.name}`, { automationId });
  
  return automation;
}

/**
 * Activate an automation (starts listening to triggers)
 */
async function activateAutomation(automationId) {
  const automation = await prisma.automation.update({
    where: { id: automationId },
    data: { isActive: true },
  });
  
  // Set up trigger listener
  const triggerType = automation.trigger?.type;
  if (triggerType) {
    triggerService.triggerEmitter.on(triggerType, async (data) => {
      try {
        const { executeAutomationFlow } = require('./triggerService');
        await executeAutomationFlow(automation, data);
      } catch (err) {
        logger.error(`Activation listener error`, { error: err.message });
      }
    });
    
    logger.info(`Automation activated: ${automation.name}`, { triggerType });
  }
  
  return automation;
}

/**
 * Deactivate an automation (stops listening to triggers)
 */
async function deactivateAutomation(automationId) {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
  });
  
  if (!automation) {
    throw new Error('Automation not found');
  }
  
  // Remove trigger listener
  const triggerType = automation.trigger?.type;
  if (triggerType) {
    triggerService.triggerEmitter.off(triggerType);
  }
  
  await prisma.automation.update({
    where: { id: automationId },
    data: { isActive: false },
  });
  
  logger.info(`Automation deactivated: ${automation.name}`);
  
  return automation;
}

/**
 * Delete an automation
 */
async function deleteAutomation(automationId) {
  // First deactivate to remove listeners
  await deactivateAutomation(automationId);
  
  // Delete related flow logs
  await prisma.flowExecutionLog.deleteMany({
    where: { automationId },
  });
  
  // Delete the automation
  await prisma.automation.delete({
    where: { id: automationId },
  });
  
  logger.info(`Automation deleted`, { automationId });
  
  return { success: true };
}

/**
 * Get all automations for an account
 */
async function getAutomations(accountId) {
  const automations = await prisma.automation.findMany({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { flowLogs: true },
      },
    },
  });
  
  return automations;
}

/**
 * Get automation by ID
 */
async function getAutomationById(automationId) {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
    include: {
      flowLogs: {
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
    },
  });
  
  if (!automation) {
    throw new Error('Automation not found');
  }
  
  return automation;
}

/**
 * Test an automation with sample data
 */
async function testAutomation(automationId, testData) {
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
  });
  
  if (!automation) {
    throw new Error('Automation not found');
  }
  
  logger.info(`Testing automation: ${automation.name}`, { testData });
  
  try {
    const { executeAutomationFlow } = require('./triggerService');
    await executeAutomationFlow(automation, testData);
    
    return { success: true, message: 'Test execution completed' };
  } catch (err) {
    logger.error('Test execution failed', { error: err.message });
    throw err;
  }
}

/**
 * Get automation execution history
 */
async function getExecutionHistory(automationId, limit = 50) {
  const logs = await prisma.flowExecutionLog.findMany({
    where: { automationId },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
  
  return logs;
}

/**
 * Get automation statistics
 */
async function getAutomationStats(accountId) {
  const [total, active, completed, failed] = await Promise.all([
    prisma.automation.count({ where: { accountId } }),
    prisma.automation.count({ where: { accountId, isActive: true } }),
    prisma.flowExecutionLog.count({ where: { status: 'COMPLETED' } }),
    prisma.flowExecutionLog.count({ where: { status: 'FAILED' } }),
  ]);
  
  return {
    total,
    active,
    completed,
    failed,
    activeRate: total > 0 ? (active / total) * 100 : 0,
    successRate: (completed + failed) > 0 ? (completed / (completed + failed)) * 100 : 0,
  };
}

/**
 * Pre-built Automation Templates
 * Common recipes that can be cloned
 */
const TEMPLATES = {
  MISSED_CALL_RECOVERY: {
    name: 'Missed Call Recovery',
    trigger: { type: TRIGGER_TYPES.MISSED_CALL_DETECTED },
    actions: [
      {
        actionType: 'send_whatsapp_pitch',
        actionData: {
          message: 'Hi {{callerName}}, we missed your call! How can we help?',
        },
      },
      {
        delay: 3600000, // 1 hour
        actionType: 'send_email_followup',
        actionData: {
          subject: 'Thanks for calling us!',
          body: 'We wanted to follow up on your call...',
        },
      },
    ],
  },
  FIVE_STAR_REVIEW_BOOSTER: {
    name: '5-Star Review Booster',
    trigger: { type: TRIGGER_TYPES.STATUS_CHANGED, value: 'CONVERTED' },
    actions: [
      {
        actionType: 'request_review_sms',
        actionData: {
          platform: 'GOOGLE',
          reviewLink: 'https://business.google.com/reviews/add',
        },
      },
    ],
  },
  ABANDONED_LEAD_REACTIVATION: {
    name: 'Abandoned Lead Reactivation',
    trigger: { type: TRIGGER_TYPES.STATUS_CHANGED, value: 'INTERESTED' },
    actions: [
      {
        delay: 259200000, // 3 days
        actionType: 'send_email_followup',
        actionData: {
          subject: 'Still interested?',
          body: 'We noticed you were interested in our services...',
        },
      },
      {
        delay: 86400000, // 1 day after first follow-up
        actionType: 'update_lead_status',
        actionData: {
          newStatus: 'FOLLOW_UP_DUE',
        },
      },
    ],
  },
  NEW_LEAD_WELCOME_SEQUENCE: {
    name: 'New Lead Welcome Sequence',
    trigger: { type: TRIGGER_TYPES.NEW_LEAD_DISCOVERED },
    actions: [
      {
        actionType: 'send_email_followup',
        actionData: {
          subject: 'Thanks for your interest!',
          body: 'We look forward to connecting...',
        },
      },
      {
        delay: 86400000, // 1 day
        actionType: 'send_whatsapp_pitch',
        actionData: {
          message: 'Hi {{leadName}}! Just wanted to say hi...',
        },
      },
    ],
  },
};

/**
 * Clone a template for an account
 */
async function createFromTemplate(accountId, templateKey) {
  const template = TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`Template not found: ${templateKey}`);
  }
  
  return await createAutomation(accountId, {
    name: `${template.name} (Copy)`,
    trigger: template.trigger,
    actions: template.actions,
  });
}

/**
 * Get available template keys
 */
function getTemplateKeys() {
  return Object.keys(TEMPLATES);
}

module.exports = {
  createAutomation,
  updateAutomation,
  activateAutomation,
  deactivateAutomation,
  deleteAutomation,
  getAutomations,
  getAutomationById,
  testAutomation,
  getExecutionHistory,
  getAutomationStats,
  TEMPLATES,
  createFromTemplate,
  getTemplateKeys,
  TRIGGER_TYPES,
};
