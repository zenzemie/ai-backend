try {
  require('dotenv').config();
  const app = require('./app');
  
  const PORT = process.env.PORT || 5000;
  
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
