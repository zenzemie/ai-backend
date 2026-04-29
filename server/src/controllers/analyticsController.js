const prisma = require('../config/prisma');

// Constants for ROI calculations as per ANALYTICS_ROI_SPECS.md
const STAFF_HOURLY_RATE = 25; // £ per hour
const MANUAL_TIME_PER_ACTION = {
  DISCOVERY: 12 / 60, // 12 mins in hours
  MESSAGE: 15 / 60,   // 15 mins in hours
  FOLLOW_UP: 5 / 60,   // 5 mins in hours
  FAQ: 10 / 60        // 10 mins in hours
};

const INDUSTRY_AVG_DEAL_VALUE = {
  1: 3500, // Tier 1: Medical, Legal, Specialized Health
  2: 1250, // Tier 2: Salons, Fine Dining, Gyms
  3: 400   // Tier 3: Cafes, Shops, Home Services
};

const SYSTEM_MONTHLY_COST = 500;

/**
 * Get core system statistics using Prisma
 */
const getSystemStats = async (req, res) => {
  try {
    // Aggregate leads by status
    const statusGroups = await prisma.lead.groupBy({
      by: ['status'],
      _count: true
    });

    const statusCounts = statusGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {});

    const totalLeads = await prisma.lead.count();
    
    // Total outreach sent
    const sentCount = await prisma.outreachLog.count({
      where: { status: 'SENT' }
    });

    // Total replies
    const repliedCount = await prisma.outreachLog.count({
      where: { status: 'REPLIED' }
    });

    const stats = {
      leadsFound: totalLeads,
      emailsSent: sentCount,
      repliesReceived: repliedCount,
      convertedClients: statusCounts['CONVERTED'] || 0,
      interestedLeads: statusCounts['INTERESTED'] || 0,
      meetingsBooked: statusCounts['MEETING_BOOKED'] || 0,
      roi: '12.4x', // Default or calculated placeholder
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Analytics Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
};

/**
 * Get ROI metrics based on formulas in ANALYTICS_ROI_SPECS.md
 */
const getROIMetrics = async (req, res) => {
  try {
    // 1. Calculate Operational Savings
    // Leads discovered
    const discoveryCount = await prisma.lead.count();
    // Outreach logs (Messages and Follow-ups)
    const totalOutreach = await prisma.outreachLog.count();
    
    // For simplicity, we'll treat all outreach as messages for now
    const hoursSaved = (discoveryCount * MANUAL_TIME_PER_ACTION.DISCOVERY) + 
                       (totalOutreach * MANUAL_TIME_PER_ACTION.MESSAGE);
    
    const operationalSavings = hoursSaved * STAFF_HOURLY_RATE;

    // 2. Calculate Revenue ROI
    // Sum deal values for converted leads
    const convertedLeads = await prisma.lead.findMany({
      where: { status: 'CONVERTED' },
      select: { industryTier: true }
    });

    const totalRevenue = convertedLeads.reduce((acc, lead) => {
      return acc + (INDUSTRY_AVG_DEAL_VALUE[lead.industryTier] || INDUSTRY_AVG_DEAL_VALUE[3]);
    }, 0);

    const revenueROI = totalRevenue > 0 
      ? (totalRevenue / SYSTEM_MONTHLY_COST) * 100 
      : 0;

    // 3. Opportunity Recovery (Mocked until CallLogs are more populated)
    const recoveredCalls = await prisma.callLog.count({
      where: { status: 'COMPLETED' }
    });
    
    const recoveryValue = recoveredCalls * 0.2 * 1000; // Formula 3: (Calls * Conversion * Avg Deal)

    res.status(200).json({
      totalMoneyRealized: operationalSavings + totalRevenue + recoveryValue,
      operationalSavings,
      totalRevenue,
      recoveryValue,
      hoursSaved: Math.round(hoursSaved),
      roiMultiple: (totalRevenue / SYSTEM_MONTHLY_COST).toFixed(1) + 'x',
      netProfit: (operationalSavings + totalRevenue + recoveryValue) - SYSTEM_MONTHLY_COST
    });
  } catch (error) {
    console.error('ROI calculation error:', error.message);
    res.status(500).json({ error: 'Failed to calculate ROI metrics' });
  }
};

/**
 * Get industry insights for heatmap and ranking
 */
const getIndustryInsights = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      select: {
        industry: true,
        status: true,
        industryTier: true
      }
    });

    const insights = leads.reduce((acc, lead) => {
      const ind = lead.industry || 'Unknown';
      if (!acc[ind]) {
        acc[ind] = { 
          name: ind, 
          count: 0, 
          converted: 0, 
          interested: 0,
          tier: lead.industryTier 
        };
      }
      acc[ind].count += 1;
      if (lead.status === 'CONVERTED') acc[ind].converted += 1;
      if (lead.status === 'INTERESTED') acc[ind].interested += 1;
      return acc;
    }, {});

    // Calculate conversion rate for each
    const processedInsights = Object.values(insights).map(i => ({
      ...i,
      conversionRate: ((i.converted / (i.count || 1)) * 100).toFixed(1),
      engagementRate: (((i.converted + i.interested) / (i.count || 1)) * 100).toFixed(1)
    }));

    res.status(200).json(processedInsights.sort((a, b) => b.count - a.count));
  } catch (error) {
    console.error('Industry insights error:', error.message);
    res.status(500).json({ error: 'Failed to fetch industry insights' });
  }
};

module.exports = {
  getSystemStats,
  getROIMetrics,
  getIndustryInsights
};
