const winston = require('winston');
const path = require('path');

const transports = [
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
];

if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
  transports.push(
    new winston.transports.File({ filename: path.join(__dirname, '../../error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(__dirname, '../../combined.log') })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-outreach-api' },
  transports: transports,
});

module.exports = logger;
