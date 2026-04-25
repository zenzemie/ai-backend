const { Worker } = require('bullmq');
const { redis } = require('../lib/redis');
const { dispatcherQueue, DISPATCHER_QUEUE_NAME } = require('../queues/outreachQueue');
const campaignService = require('../services/campaignService');

const dispatcherWorker = new Worker(
  DISPATCHER_QUEUE_NAME,
  async (job) => {
    const { campaignId } = job.data;
    console.log(`Starting dispatch for campaign ${campaignId}`);

    return campaignService.dispatchLeadsInBatches(campaignId);
  },
  {
    connection: redis,
    concurrency: 1,
    removeOnComplete: true,
    removeOnFail: false,
  }
);

dispatcherWorker.on('completed', (job, result) => {
  console.log(`Dispatcher job ${job.id} completed:`, result.message);
});

dispatcherWorker.on('failed', (job, err) => {
  console.error(`Dispatcher job ${job?.id} failed:`, err.message);
});

dispatcherWorker.on('error', (err) => {
  console.error('Dispatcher worker error:', err);
});

process.on('SIGINT', () => {
  dispatcherWorker.close().then(() => {
    console.log('Dispatcher worker closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  dispatcherWorker.close().then(() => {
    console.log('Dispatcher worker closed');
    process.exit(0);
  });
});

module.exports = dispatcherWorker;
