/**
 * Trigger Detection Service
 * Monitors system events and fires automation flows when trigger conditions are met
 * Acts as the event emitter / webhook listener for the automation engine
 */
const EventEmitter = require('events');
const logger = require('../logger');
const prisma = require('../../config/prisma');

// Create a singleton event emitter for internal triggers
const triggerEmitter = new EventEmitter();
triggerEmitter.setMaxListeners(100); // Allow many listeners for complex flows

/**
 * Trigger Types
 * Maps to the triggers defined in AUTOMATION_ENGINE_SPECS.md
 */
const TRIGGER_TYPES = {
  // Lead Discovery
  NEW_LEAD_DISCOVERED: 'new_lead_discovered',
  
  // Outreach
  EMAIL_OPENED: 'email_opened',
  REPLIED_INTERESTED: 'replied_interested',
  STATUS_CHANGED: 'status_changed',
  
  // Receptionist
  MISSED_CALL_DETECTED: 'missed_call_detected',
  APPOINTMENT_BOOKED_VOICE: 'appointment_booked_voice',
  
  // Website
  WA_BUTTON_CLICKED: 'wa_button_clicked',
  
  // Reputation
  NEGATIVE_REVIEW_RECEIVED: 'negative_review_received',
  
  // CRM
  STATUS_CHANGED: 'status_changed',
  
  // Webhook / Scheduled
  WEBHOOK_INBOUND: 'webhook_inbound',
  SCHEDULED_TRIGGER: 'scheduled_trigger',
};

/**
 * Internal System Triggers
 * Emit events that the automation engine can listen to
 */

// Lead Discovery Trigger
async function emitNewLeadDiscovered(lead) {
  logger.info('Trigger: new_lead_discovered', { leadId: lead.id, name: lead.name });
  triggerEmitter.emit(TRIGGER_TYPES.NEW_LEAD_DISCOVERED, lead);
  
  // Find and execute any automations listening to this trigger
  await executeAutomationsForTrigger(TRIGGER_TYPES.NEW_LEAD_DISCOVERED, { lead });
}

// Outreach Triggers
async function emitEmailOpened(leadId, outreachLogId) {
  logger.info('Trigger: email_opened', { leadId, outreachLogId });
  triggerEmitter.emit(TRIGGER_TYPES.EMAIL_OPENED, { leadId, outreachLogId });
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.EMAIL_OPENED, { leadId, outreachLogId });
}

async function emitRepliedInterested(leadId, response) {
  logger.info('Trigger: replied_interested', { leadId });
  triggerEmitter.emit(TRIGGER_TYPES.REPLIED_INTERESTED, { leadId, response });
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.REPLIED_INTERESTED, { leadId, response });
}

async function emitStatusChanged(leadId, oldStatus, newStatus) {
  logger.info('Trigger: status_changed', { leadId, oldStatus, newStatus });
  triggerEmitter.emit(TRIGGER_TYPES.STATUS_CHANGED, { leadId, oldStatus, newStatus });
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.STATUS_CHANGED, { leadId, oldStatus, newStatus });
}

// Receptionist Triggers
async function emitMissedCallDetected(callLog) {
  logger.info('Trigger: missed_call_detected', { callLogId: callLog.id });
  triggerEmitter.emit(TRIGGER_TYPES.MISSED_CALL_DETECTED, callLog);
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.MISSED_CALL_DETECTED, { callLog });
}

async function emitAppointmentBookedVoice(receptionistId, appointmentDetails) {
  logger.info('Trigger: appointment_booked_voice', { receptionistId });
  triggerEmitter.emit(TRIGGER_TYPES.APPOINTMENT_BOOKED_VOICE, { receptionistId, appointmentDetails });
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.APPOINTMENT_BOOKED_VOICE, { receptionistId, appointmentDetails });
}

// Website Triggers
async function emitWaButtonClicked(leadData) {
  logger.info('Trigger: wa_button_clicked', { websiteId: leadData.websiteId });
  triggerEmitter.emit(TRIGGER_TYPES.WA_BUTTON_CLICKED, leadData);
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.WA_BUTTON_CLICKED, leadData);
}

// Reputation Triggers
async function emitNegativeReviewReceived(reviewData) {
  logger.info('Trigger: negative_review_received', { rating: reviewData.rating });
  triggerEmitter.emit(TRIGGER_TYPES.NEGATIVE_REVIEW_RECEIVED, reviewData);
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.NEGATIVE_REVIEW_RECEIVED, reviewData);
}

/**
 * External Webhook Handler
 * Receives inbound webhooks and triggers automations
 */
async function handleInboundWebhook(accountId, flowId, payload) {
  logger.info('Webhook inbound received', { accountId, flowId });
  
  triggerEmitter.emit(TRIGGER_TYPES.WEBHOOK_INBOUND, {
    accountId,
    flowId,
    payload,
    receivedAt: new Date().toISOString(),
  });
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.WEBHOOK_INBOUND, {
    accountId,
    flowId,
    payload,
  });
}

/**
 * Scheduled Trigger Handler
 * Fires scheduled automations based on cron-like expressions
 */
async function handleScheduledTrigger(accountId, automationId, cronExpression) {
  logger.info('Scheduled trigger fired', { accountId, automationId, cronExpression });
  
  triggerEmitter.emit(TRIGGER_TYPES.SCHEDULED_TRIGGER, {
    accountId,
    automationId,
    firedAt: new Date().toISOString(),
  });
  
  await executeAutomationsForTrigger(TRIGGER_TYPES.SCHEDULED_TRIGGER, {
    accountId,
    automationId,
  });
}

/**
 * Execute all automations matching a trigger type
 */
async function executeAutomationsForTrigger(triggerType, triggerData) {
  try {
    // Find all active automations with this trigger type
    const automations = await prisma.automation.findMany({
      where: {
        isActive: true,
        trigger: {
          path: ['type'],
          equals: triggerType,
        },
      },
    });
    
    logger.info(`Found ${automations.length} automations for trigger: ${triggerType}`);
    
    for (const automation of automations) {
      try {
        await executeAutomationFlow(automation, triggerData);
      } catch (err) {
        logger.error(`Automation execution failed: ${err.message}`, {
          automationId: automation.id,
          triggerType,
        });
      }
    }
  } catch (err) {
    logger.error('Error executing automations for trigger', { error: err.message, triggerType });
  }
}

/**
 * Execute a single automation flow
 */
async function executeAutomationFlow(automation, triggerData) {
  const { id, name, actions, accountId } = automation;
  
  logger.info(`Executing automation flow: ${name}`, { automationId: id });
  
  // Create flow execution log
  const flowLog = await prisma.flowExecutionLog.create({
    data: {
      automationId: id,
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });
  
  try {
    // Parse actions array (each action has type, data, and optional condition)
    const actionSteps = typeof actions === 'string' ? JSON.parse(actions) : actions;
    
    for (let stepIndex = 0; stepIndex < actionSteps.length; stepIndex++) {
      const step = actionSteps[stepIndex];
      
      // Check if step has a condition (filter/if-else)
      if (step.condition) {
        const conditionMet = await evaluateCondition(step.condition, triggerData);
        if (!conditionMet) {
          logger.info(`Step ${stepIndex} condition not met, skipping`, {
            automationId: id,
            condition: step.condition,
          });
          continue;
        }
      }
      
      // Check for AI Classifier
      if (step.actionType === 'ai_classifier') {
        const openaiService = require('../openaiService');
        const classification = await openaiService.classifyIntent(
          getNestedValue(triggerData, step.actionData.field),
          step.actionData.categories
        );
        
        logger.info(`Step ${stepIndex} AI Classification: ${classification}`, {
          automationId: id,
        });
        
        // Find the branch matching the classification
        const nextStepIndex = step.branches?.[classification];
        if (nextStepIndex !== undefined) {
          stepIndex = nextStepIndex - 1; // Subtract 1 because loop increments
        }
        continue;
      }
      
      // Check for delay (wait step)
      if (step.delay) {
        const queueService = require('./queueService');
        await queueService.queueAction(step.actionType, {
          ...step.actionData,
          automationId: id,
          stepIndex,
          flowLogId: flowLog.id,
          idempotencyKey: `${id}-step-${stepIndex}-${Date.now()}`,
        }, {
          delay: step.delay,
        });
        
        logger.info(`Step ${stepIndex} queued for delayed execution`, {
          automationId: id,
          delay: step.delay,
        });
        
        continue;
      }
      
      // Execute action immediately
      const queueService = require('./queueService');
      const result = await queueService.queueAction(step.actionType, {
        ...step.actionData,
        automationId: id,
        stepIndex,
        flowLogId: flowLog.id,
        idempotencyKey: `${id}-step-${stepIndex}-${Date.now()}`,
      });
      
      logger.info(`Step ${stepIndex} executed: ${step.actionType}`, { automationId: id });
    }
    
    // Update flow log as completed
    await prisma.flowExecutionLog.update({
      where: { id: flowLog.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    
    logger.info(`Automation flow completed: ${name}`, { automationId: id });
  } catch (err) {
    logger.error(`Automation flow failed: ${err.message}`, { automationId: id });
    
    await prisma.flowExecutionLog.update({
      where: { id: flowLog.id },
      data: {
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date(),
      },
    });
    
    throw err;
  }
}

/**
 * Evaluate a condition against trigger data
 * Supports simple operators: ==, !=, >, <, >=, <=, AND, OR
 */
async function evaluateCondition(condition, triggerData) {
  const { field, operator, value } = condition;
  
  // Extract field value from trigger data (supports nested paths like "lead.name")
  const fieldValue = getNestedValue(triggerData, field);
  
  switch (operator) {
    case '==':
      return fieldValue == value;
    case '!=':
      return fieldValue != value;
    case '>':
      return fieldValue > value;
    case '<':
      return fieldValue < value;
    case '>=':
      return fieldValue >= value;
    case '<=':
      return fieldValue <= value;
    case 'AND':
      return condition.conditions.every(c => evaluateCondition(c, triggerData));
    case 'OR':
      return condition.conditions.some(c => evaluateCondition(c, triggerData));
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    default:
      logger.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set up automation event listeners
 * Called during server startup to bind automations to triggers
 */
async function initializeTriggerListeners() {
  logger.info('Initializing trigger listeners...');
  
  // Load all active automations and set up their listeners
  const automations = await prisma.automation.findMany({
    where: { isActive: true },
  });
  
  for (const automation of automations) {
    const triggerType = automation.trigger?.type;
    
    if (triggerType) {
      triggerEmitter.on(triggerType, async (data) => {
        try {
          await executeAutomationFlow(automation, data);
        } catch (err) {
          logger.error(`Listener error for ${triggerType}`, { error: err.message });
        }
      });
      
      logger.info(`Bound automation "${automation.name}" to trigger: ${triggerType}`);
    }
  }
  
  logger.info(`Initialized ${automations.length} trigger listeners`);
}

/**
 * Get all registered trigger types
 */
function getTriggerTypes() {
  return { ...TRIGGER_TYPES };
}

module.exports = {
  TRIGGER_TYPES,
  triggerEmitter,
  emitNewLeadDiscovered,
  emitEmailOpened,
  emitRepliedInterested,
  emitStatusChanged,
  emitMissedCallDetected,
  emitAppointmentBookedVoice,
  emitWaButtonClicked,
  emitNegativeReviewReceived,
  handleInboundWebhook,
  handleScheduledTrigger,
  initializeTriggerListeners,
  getTriggerTypes,
};
