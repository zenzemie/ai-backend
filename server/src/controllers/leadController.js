const prisma = require('../config/prisma');
const { searchBusinesses, calculateLeadMetrics, crawlWebsite } = require('../services/discoveryService');
const { emitNewLeadDiscovered, emitStatusChanged } = require('../services/automation/triggerService');

const discoverLeads = async (req, res) => {
  const { category, location, accountId } = req.body;

  try {
    // ... (logic for targetAccountId)
    let targetAccountId = accountId;
    if (!targetAccountId) {
      const defaultAccount = await prisma.account.findFirst();
      if (!defaultAccount) {
        const newAcc = await prisma.account.create({
          data: { name: 'Main Agency', domain: 'main.leadforge.ai' }
        });
        targetAccountId = newAcc.id;
      } else {
        targetAccountId = defaultAccount.id;
      }
    }

    console.log(`Starting discovery for ${category} in ${location}...`);
    const businesses = await searchBusinesses(category, location);
    
    if (!businesses || businesses.length === 0) {
      return res.status(200).json({ message: 'No businesses found.', leads: [] });
    }

    const processedLeads = [];

    // Map businesses to a list of promises for faster processing
    const processingPromises = businesses.map(async (business) => {
      const metrics = calculateLeadMetrics(business, category);
      
      // Try to find more info from website
      const websiteInfo = await crawlWebsite(business.url);
      
      const leadData = {
        name: business.name,
        website: business.url,
        phone: business.display_phone || null,
        email: websiteInfo.email,
        instagram: websiteInfo.instagram,
        facebook: websiteInfo.facebook,
        industry: category,
        rating: business.rating,
        reviewCount: business.review_count,
        city: location,
        googlePlaceId: business.id, // Using Yelp ID as placeholder if Google not used
        
        // Operation Black Forge Metrics
        automationNeedScore: metrics.automationNeedScore,
        industryTier: metrics.industryTier,
        opportunityScore: metrics.opportunityScore,
        revenuePotential: metrics.revenuePotential,
        urgency: metrics.urgency,
        hasUrgencyMarker: metrics.hasUrgencyMarker,
        hasEfficiencyMarker: metrics.hasEfficiencyMarker,
        hasRecoveryMarker: metrics.hasRecoveryMarker,
        
        accountId: targetAccountId,
        status: 'DISCOVERED',
        notes: `Yelp Rating: ${business.rating}, Reviews: ${business.review_count}`
      };

      // Upsert to prevent duplicates
      return prisma.lead.upsert({
        where: { googlePlaceId: business.id },
        update: leadData,
        create: leadData,
      });
    });

    const savedLeads = await Promise.all(processingPromises);

    // Emit triggers for new leads
    savedLeads.forEach(lead => {
      emitNewLeadDiscovered(lead).catch(err => 
        console.error(`Failed to emit lead trigger for ${lead.id}:`, err.message)
      );
    });

    res.status(200).json({
      message: `Found and analyzed ${savedLeads.length} leads.`,
      leads: savedLeads
    });

  } catch (error) {
    console.error('Discovery Engine Error:', error.message);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
};

const getAllLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { opportunityScore: 'desc' }
    });
    res.status(200).json(leads);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

const getLeadById = async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { outreachLogs: true }
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.status(200).json(lead);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
};

const updateLead = async (req, res) => {
  try {
    const oldLead = await prisma.lead.findUnique({
      where: { id: req.params.id }
    });
    
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: req.body
    });
    
    // Emit status change trigger if changed
    if (oldLead && req.body.status && oldLead.status !== req.body.status) {
      emitStatusChanged(lead.id, oldLead.status, lead.status).catch(err =>
        console.error(`Failed to emit status trigger for ${lead.id}:`, err.message)
      );
    }
    
    res.status(200).json(lead);
  } catch (e) {
    res.status(500).json({ error: 'Update failed' });
  }
};

const deleteLead = async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

const createLead = async (req, res) => {
  try {
    const lead = await prisma.lead.create({ data: req.body });
    
    // Emit new lead trigger
    emitNewLeadDiscovered(lead).catch(err =>
      console.error(`Failed to emit lead trigger for ${lead.id}:`, err.message)
    );
    
    res.status(201).json(lead);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
};

module.exports = {
  discoverLeads,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  createLead,
};
