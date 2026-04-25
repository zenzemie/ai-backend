const { RateLimiterRedis } = require('rate-limiter-flexible');
const { redis } = require('./redis');

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit',
  points: parseInt(process.env.RATE_LIMIT_POINTS, 10) || 10,
  duration: parseInt(process.env.RATE_LIMIT_DURATION, 10) || 1,
  blockDuration: 5,
});

rateLimiter.on('error', (err) => {
  console.error('Rate limiter error:', err);
});

module.exports = rateLimiter;
