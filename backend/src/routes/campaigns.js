const express = require('express');
const router = express.Router();
const campaignService = require('../services/campaignService');
const outreachService = require('../services/outreachService');

router.post('/', async (req, res) => {
  try {
    const { name, industry, messageTemplate } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ error: 'name and industry are required' });
    }

    const campaign = await campaignService.createCampaign({
      name,
      industry,
      messageTemplate,
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { skip = 0, take = 20, status } = req.query;
    const campaigns = await campaignService.listCampaigns({
      skip: parseInt(skip, 10),
      take: parseInt(take, 10),
      status,
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error listing campaigns:', error);
    res.status(500).json({ error: 'Failed to list campaigns' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const campaign = await campaignService.getCampaign(req.params.id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(500).json({ error: 'Failed to get campaign' });
  }
});

router.post('/:id/start', async (req, res) => {
  try {
    const result = await campaignService.startCampaign(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/pause', async (req, res) => {
  try {
    const result = await campaignService.pauseCampaign(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error pausing campaign:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await campaignService.cancelCampaign(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const stats = await outreachService.getCampaignStats(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    res.status(500).json({ error: 'Failed to get campaign stats' });
  }
});

module.exports = router;
