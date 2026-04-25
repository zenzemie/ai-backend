const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const nexus = require('../nexus');

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

router.post('/nexus/trigger', async (req, res) => {
  try {
    await nexus.triggerScout(req.body);
    res.json({ status: 'Accepted', message: 'Nexus swarm has been triggered' });
  } catch (error) {
    console.error('Error triggering Nexus:', error);
    res.status(500).json({ error: 'Failed to trigger Nexus' });
  }
});

module.exports = router;
