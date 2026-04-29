/**
 * LeadForge AI - Server Entry Point
 * Starts the Express server with all middleware and routes
 */
const app = require('./src/app');
const logger = require('./src/services/logger');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`LeadForge AI API running on http://${HOST}:${PORT}`);
  console.log(`🚀 LeadForge AI API running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = server;
