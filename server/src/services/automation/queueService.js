/**
 * Queue Service - BullMQ worker queue for delayed automation actions
 * Handles retry logic, idempotency, and observability
 */
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

// Redis connection - use env or fallback
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create Redis connection for BullMQ
let connection;
try {
  connection = new IORedis(redisConfig);
  connection.on('error', (err) => {
    logger.error('Redis connection error:', err.message);
  });
} catch (err) {
  logger.warn('Redis not available, using fallback in-memory queue');
}

// In-memory fallback queue (when Redis is not available)
const inMemoryQueue = {
  jobs: new Map(),
  add: async (name, data, opts) => {
    const jobId = uuidv4();
    const job = {
      id: jobId,
      name,
      data,
      opts,
      progress: 0,
      status: 'waiting',
    };
    inMemoryQueue.jobs.set(jobId, job);
    
    // Execute after delay if specified
    if (opts && opts.delay) {
      setTimeout(() => executeJob(job), opts.delay);
    } else {
      setTimeout(() => executeJob(job), 100);
    }
    return { id: jobId, name };
  },
  getJob: async (id) => inMemoryQueue.jobs.get(id),
};

const inMemoryWorker = {
  process: async (processor) => {
    inMemoryQueue.processor = processor;
  },
};

async function executeJob(job) {
  try {
    job.status = 'active';
    if (inMemoryQueue.processor) {
      await inMemoryQueue.processor(job);
    }
    job.status = 'completed';
  } catch (err) {
    job.status = 'failed';
    job.failedReason = err.message;
  }
}

// Main automation queue
let automationQueue;
let automationWorker;

/**
 * Initialize the worker and queue
 */
async function initializeQueue() {
  if (connection) {
    automationQueue = new Queue('automation-actions', { connection });
    
    automationWorker = new Worker(
      'automation-actions',
      processAutomationJob,
      { connection, concurrency: 5 }
    );
    
    automationWorker.on('completed', (job, result) => {
      logger.info(`Automation job completed: ${job.id}`, { result });
    });
    
    automationWorker.on('failed', (job, err) => {
      logger.error(`Automation job failed: ${job.id}`, { error: err.message });
    });
    
    automationWorker.on('error', (err) => {
      logger.error('Automation worker error:', err.message);
    });
    
    logger.info('BullMQ automation worker initialized');
  } else {
    logger.info('Using in-memory automation worker');
    inMemoryWorker.process(processAutomationJob);
  }
}

/**
 * Core job processor
 */
async function processAutomationJob(job) {
  logger.info(`Processing automation job: ${job.name}`, { jobId: job.id, data: job.data });
  
  const { actionType, actionData, automationId, stepIndex, flowLogId } = job.data;
  
  try {
    // Execute action based on type
    const result = await executeAction(actionType, actionData, automationId);
    
    // Update flow log
    if (flowLogId) {
      await updateFlowLog(flowLogId, stepIndex, 'SUCCESS', result);
    }
    
    return { success: true, result };
  } catch (err) {
    logger.error(`Automation job failed: ${err.message}`, { jobId: job.id });
    
    if (flowLogId) {
      await updateFlowLog(flowLogId, stepIndex, 'FAILED', { error: err.message });
    }
    
    throw err;
  }
}

/**
 * Add a delayed action to the queue
 * @param {string} actionType - Type of action (send_email_followup, send_whatsapp_pitch, etc.)
 * @param {object} actionData - Data payload for the action
 * @param {object} options - Queue options (delay, retry, etc.)
 */
async function queueAction(actionType, actionData, options = {}) {
  const jobData = {
    actionType,
    actionData,
    automationId: actionData.automationId,
    stepIndex: actionData.stepIndex,
    flowLogId: actionData.flowLogId,
    queuedAt: new Date().toISOString(),
  };
  
  // Idempotency key prevents duplicate actions
  const idempotencyKey = actionData.idempotencyKey || `${actionType}-${JSON.stringify(actionData)}`;
  
  const queueOptions = {
    jobId: idempotencyKey, // BullMQ uses this to prevent duplicates
    removeOnComplete: 100,
    removeOnFail: 1000,
    ...options,
  };
  
  if (automationQueue) {
    return await automationQueue.add(actionType, jobData, queueOptions);
  } else {
    return await inMemoryQueue.add(actionType, jobData, queueOptions);
  }
}

/**
 * Execute an automation action
 */
async function executeAction(actionType, actionData, automationId) {
  const ActionHandlers = require('./actionHandlers');
  const handler = ActionHandlers[actionType];
  
  if (!handler) {
    throw new Error(`Unknown action type: ${actionType}`);
  }
  
  return await handler(actionData, automationId);
}

/**
 * Update flow execution log
 */
async function updateFlowLog(flowLogId, stepIndex, status, result) {
  const prisma = require('../../config/prisma');
  
  try {
    const log = await prisma.flowExecutionLog.findUnique({
      where: { id: flowLogId },
    });
    
    if (log) {
      const currentMetadata = log.metadata || {};
      const steps = currentMetadata.steps || [];
      
      steps.push({
        stepIndex,
        status,
        result,
        timestamp: new Date().toISOString(),
      });
      
      await prisma.flowExecutionLog.update({
        where: { id: flowLogId },
        data: {
          metadata: {
            ...currentMetadata,
            steps,
          },
        },
      });
    }
  } catch (err) {
    logger.error('Failed to update flow log', { error: err.message, flowLogId });
  }
}

/**
 * Get queue stats
 */
async function getQueueStats() {
  if (automationQueue) {
    const counts = await automationQueue.getJobCounts();
    return counts;
  }
  return { waiting: 0, active: 0, completed: 0, failed: 0 };
}

/**
 * Close queue connections gracefully
 */
async function closeQueue() {
  if (automationWorker) {
    await automationWorker.close();
  }
  if (connection) {
    await connection.quit();
  }
}

module.exports = {
  initializeQueue,
  queueAction,
  getQueueStats,
  closeQueue,
  // Expose for testing
  _getQueue: () => automationQueue,
  _getInMemoryQueue: () => inMemoryQueue,
};
