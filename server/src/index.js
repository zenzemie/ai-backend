try {
  require('dotenv').config();
  const app = require('./app');
  const { initializeTriggerListeners } = require('./services/automation/triggerService');
  const { initializeQueue } = require('./services/automation/queueService');
  
  const PORT = process.env.PORT || 5000;
  
  // Initialize automation services
  Promise.all([
    initializeTriggerListeners(),
    initializeQueue()
  ]).then(() => {
    console.log('Automation systems initialized');
  }).catch((err) => {
    console.error('Failed to initialize automation systems:', err.message);
  });
  
  app.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
      console.error('FAILED TO LISTEN:', err);
      process.exit(1);
    }
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error('BOOTSTRAP ERROR:', error);
  process.exit(1);
}
