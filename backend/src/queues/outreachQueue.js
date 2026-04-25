const { Queue, Worker } = require('bullmq');
const { redis } = require('../lib/redis');

const OUTREACH_QUEUE_NAME = 'outreach';
const DISPATCHER_QUEUE_NAME = 'dispatcher';

const outreachQueueConnection = {
  connection: redis,
};

const outreachQueue = new Queue(OUTREACH_QUEUE_NAME, outreachQueueConnection);
const dispatcherQueue = new Queue(DISPATCHER_QUEUE_NAME, outreachQueueConnection);

outreachQueue.on('error', (err) => {
  console.error('Outreach queue error:', err);
});

dispatcherQueue.on('error', (err) => {
  console.error('Dispatcher queue error:', err);
});

async function closeAllQueues() {
  await Promise.all([
    outreachQueue.close(),
    dispatcherQueue.close(),
  ]);
}

module.exports = {
  outreachQueue,
  dispatcherQueue,
  closeAllQueues,
  OUTREACH_QUEUE_NAME,
  DISPATCHER_QUEUE_NAME,
};
