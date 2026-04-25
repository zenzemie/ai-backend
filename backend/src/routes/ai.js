const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

router.post('/generate', (req, res) => {
  const { name, industry, template } = req.body;

  if (!name && !industry && !template) {
    return res.status(400).json({ error: 'At least one parameter (name, industry, or template) is required' });
  }

  try {
    const message = aiService.generateMessage(name, industry, template);
    res.json({ message });
  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

module.exports = router;
