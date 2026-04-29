const websiteService = require('../services/websiteService');

const createWebsite = async (req, res) => {
  try {
    const { accountId } = req.user; // Assuming auth middleware sets req.user
    const website = await websiteService.createWebsite({
      ...req.body,
      accountId,
    });
    res.status(201).json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWebsites = async (req, res) => {
  try {
    const { accountId } = req.user;
    const websites = await websiteService.getWebsites(accountId);
    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWebsiteById = async (req, res) => {
  try {
    const website = await websiteService.getWebsiteById(req.params.id);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWebsiteBySlug = async (req, res) => {
  try {
    const website = await websiteService.getWebsiteBySlug(req.params.slug);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWebsite = async (req, res) => {
  try {
    const website = await websiteService.updateWebsite(req.params.id, req.body);
    res.json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteWebsite = async (req, res) => {
  try {
    await websiteService.deleteWebsite(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateWebsite = async (req, res) => {
  try {
    const { accountId } = req.user;
    const { leadId, templateId } = req.body;
    const website = await websiteService.generateWebsite(accountId, leadId, templateId);
    res.status(201).json(website);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createWebsite,
  getWebsites,
  getWebsiteById,
  getWebsiteBySlug,
  updateWebsite,
  deleteWebsite,
  generateWebsite,
};
