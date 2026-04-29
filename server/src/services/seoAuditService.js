/**
 * SEO Audit Service
 * Handles local SEO audits, GMB optimization, and citation monitoring
 * Part of System #7 - AI Social Media & SEO Growth
 */
const logger = require('./logger');
const prisma = require('../config/prisma');
const openaiService = require('./openaiService');

// ============================================
// GMB OPTIMIZATION AUDIT CHECKLIST
// ============================================

/**
 * GMB Optimization Checklist Items
 */
const GMB_CHECKLIST = {
  basics: [
    {
      id: 'business_name',
      task: 'Business name matches exactly across all platforms',
      priority: 'high',
      category: 'NAP Consistency',
    },
    {
      id: 'address_consistency',
      task: 'Address is consistent with USPS format',
      priority: 'high',
      category: 'NAP Consistency',
    },
    {
      id: 'phone_consistency',
      task: 'Phone number matches across all directories (including country code)',
      priority: 'high',
      category: 'NAP Consistency',
    },
    {
      id: 'business_description',
      task: 'Business description complete with target keywords (750+ chars)',
      priority: 'high',
      category: 'GMB Completeness',
    },
    {
      id: 'hours_accuracy',
      task: 'All hours accurate and up-to-date (including special hours)',
      priority: 'high',
      category: 'GMB Completeness',
    },
    {
      id: 'website_url',
      task: 'Website URL is correct and working',
      priority: 'medium',
      category: 'GMB Completeness',
    },
  ],
  media: [
    {
      id: 'exterior_photos',
      task: 'Upload exterior business photos',
      priority: 'high',
      category: 'Media',
    },
    {
      id: 'interior_photos',
      task: 'Upload interior/business atmosphere photos',
      priority: 'medium',
      category: 'Media',
    },
    {
      id: 'team_photos',
      task: 'Upload team/staff photos',
      priority: 'medium',
      category: 'Media',
    },
    {
      id: 'product_photos',
      task: 'Upload product or service photos',
      priority: 'medium',
      category: 'Media',
    },
    {
      id: 'logo_uploaded',
      task: 'Business logo uploaded to GMB',
      priority: 'medium',
      category: 'Media',
    },
  ],
  services: [
    {
      id: 'services_list',
      task: 'Services list is complete with descriptions',
      priority: 'high',
      category: 'Services',
    },
    {
      id: 'attributes',
      task: 'Business attributes filled out (wheelchair accessible, gender neutral, etc.)',
      priority: 'low',
      category: 'Attributes',
    },
    {
      id: 'products_menu',
      task: 'Products/Menu uploaded (for relevant businesses)',
      priority: 'medium',
      category: 'Products',
    },
  ],
  engagement: [
    {
      id: 'recent_posts',
      task: 'Posted "What\'s New" update in last 7 days',
      priority: 'high',
      category: 'Recency Signal',
    },
    {
      id: 'qa_section',
      task: 'Q&A section populated with common questions',
      priority: 'medium',
      category: 'Engagement',
    },
    {
      id: 'reviews_responded',
      task: 'Responded to recent reviews (positive and negative)',
      priority: 'high',
      category: 'Engagement',
    },
  ],
};

/**
 * Citation sources to monitor
 */
const CITATION_SOURCES = [
  { name: 'Google Business Profile', required: true },
  { name: 'Apple Maps', required: true },
  { name: 'Facebook', required: true },
  { name: 'Yelp', required: false },
  { name: 'Yellow Pages', required: false },
  { name: 'Bing Places', required: false },
  { name: 'Foursquare', required: false },
  { name: 'TripAdvisor', required: false },
  { name: 'LinkedIn', required: false },
  { name: 'Instagram', required: false },
];

/**
 * Run a comprehensive SEO audit for a business
 * @param {Object} businessData - Business information
 * @param {string} accountId - Account ID for database logging
 * @returns {Object} Complete audit results
 */
async function runSEOAudit(businessData, accountId) {
  const { businessId, name, industry, location } = businessData;

  logger.info('Starting SEO audit', { businessId, name });

  try {
    // Simulate audit data (in production, would call BrightLocal, SEMrush, etc.)
    const auditData = await simulateSEOAudit(businessData);

    // Calculate GMB completeness score
    const gmbScore = calculateGMBCompletenessScore(auditData.gmbData);

    // Calculate citation consistency score
    const citationScore = await calculateCitationConsistencyScore(businessData);

    // Analyze local keyword rankings
    const keywordRankings = await analyzeLocalKeywordRankings(name, industry, location);

    // Generate action items
    const actionItems = generateActionItems(auditData, gmbScore, citationScore);

    // Calculate overall SEO health score
    const seoHealthScore = Math.round((gmbScore * 0.4 + citationScore * 0.3 + keywordRankings.score * 0.3));

    // Store or update audit in database
    const existingAudit = await prisma.sEOAudit.findFirst({
      where: { businessId, accountId },
    });

    let audit;
    if (existingAudit) {
      audit = await prisma.sEOAudit.update({
        where: { id: existingAudit.id },
        data: {
          gmbCompletenessScore: gmbScore,
          citationConsistencyScore: citationScore,
          localKeywordRankings: JSON.stringify(keywordRankings.rankings),
          actionItems: JSON.stringify(actionItems),
          seoHealthScore,
          lastAuditedAt: new Date(),
        },
      });
    } else {
      audit = await prisma.sEOAudit.create({
        data: {
          businessId,
          gmbCompletenessScore: gmbScore,
          citationConsistencyScore: citationScore,
          localKeywordRankings: JSON.stringify(keywordRankings.rankings),
          actionItems: JSON.stringify(actionItems),
          seoHealthScore,
          accountId,
        },
      });
    }

    logger.info('SEO audit completed', {
      businessId,
      gmbScore,
      citationScore,
      seoHealthScore,
    });

    return {
      success: true,
      audit: {
        ...audit,
        localKeywordRankings: keywordRankings.rankings,
        actionItems,
      },
      scores: {
        gmbCompleteness: gmbScore,
        citationConsistency: citationScore,
        keywordRanking: keywordRankings.score,
        overallHealth: seoHealthScore,
      },
    };
  } catch (error) {
    logger.error('SEO audit failed', { error: error.message });
    throw error;
  }
}

/**
 * Simulate SEO audit data (placeholder for real API calls)
 */
async function simulateSEOAudit(businessData) {
  // In production, this would call BrightLocal API or similar
  // const response = await fetch(`https://api.brightlocal.com/v4/seo-audit`, { ... });

  return {
    gmbData: {
      name: businessData.name || 'Business',
      descriptionComplete: Math.random() > 0.5,
      hoursUpdated: Math.random() > 0.3,
      photosCount: Math.floor(Math.random() * 10) + 1,
      servicesComplete: Math.random() > 0.4,
      recentPost: Math.random() > 0.5,
      reviewsResponded: Math.random() > 0.6,
    },
    citations: [
      { name: 'Google Business Profile', found: true, consistent: true },
      { name: 'Apple Maps', found: true, consistent: true },
      { name: 'Facebook', found: true, consistent: Math.random() > 0.3 },
      { name: 'Yelp', found: Math.random() > 0.5, consistent: Math.random() > 0.5 },
      { name: 'Yellow Pages', found: Math.random() > 0.6, consistent: Math.random() > 0.5 },
    ],
    localKeywords: [
      `${businessData.name || 'Business'} in ${businessData.location || 'Local Area'}`,
      `${businessData.industry || 'Service'} near me`,
    ],
  };
}

/**
 * Calculate GMB completeness score (0-100)
 */
function calculateGMBCompletenessScore(gmbData) {
  let score = 0;

  // Basic info (40 points)
  if (gmbData.name) score += 10;
  if (gmbData.descriptionComplete) score += 15;
  if (gmbData.hoursUpdated) score += 15;

  // Media (20 points)
  if (gmbData.photosCount >= 3) score += 10;
  if (gmbData.photosCount >= 7) score += 10;

  // Services/Products (15 points)
  if (gmbData.servicesComplete) score += 15;

  // Engagement (25 points)
  if (gmbData.recentPost) score += 15;
  if (gmbData.reviewsResponded) score += 10;

  return Math.min(score, 100);
}

/**
 * Calculate citation consistency score (0-100)
 */
async function calculateCitationConsistencyScore(businessData) {
  // In production, check actual citations
  // For now, simulate with weighted scoring

  const { name, address, phone } = businessData;
  
  let baseScore = 70; // Base score for having basic NAP

  // Check consistency across simulated sources
  const citationChecks = CITATION_SOURCES.map(source => ({
    ...source,
    found: Math.random() > 0.3,
    consistent: Math.random() > 0.2,
  }));

  const foundCount = citationChecks.filter(c => c.found).length;
  const consistentCount = citationChecks.filter(c => c.consistent).length;

  // Score based on findings
  const foundRatio = foundCount / CITATION_SOURCES.length;
  const consistentRatio = foundCount > 0 ? consistentCount / foundCount : 0;

  baseScore = Math.round(foundRatio * 50 + consistentRatio * 50);

  return Math.min(baseScore, 100);
}

/**
 * Analyze local keyword rankings
 */
async function analyzeLocalKeywordRankings(businessName, industry, location) {
  // In production, call ranking API (BrightLocal, Whitespark, etc.)
  
  const keywords = [
    {
      keyword: `${industry || 'Service'} in ${location || 'Local Area'}`,
      position: Math.floor(Math.random() * 20) + 1,
      searchVolume: Math.floor(Math.random() * 2000) + 100,
    },
    {
      keyword: `${businessName || 'Business'} near me`,
      position: Math.floor(Math.random() * 15) + 1,
      searchVolume: Math.floor(Math.random() * 1000) + 50,
    },
    {
      keyword: `${industry || 'Local business'}`,
      position: Math.floor(Math.random() * 25) + 5,
      searchVolume: Math.floor(Math.random() * 5000) + 200,
    },
  ];

  // Calculate keyword score (average position weighted by search volume)
  const avgPosition = keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length;
  const keywordScore = Math.max(0, Math.round(100 - (avgPosition - 1) * 4));

  return {
    score: keywordScore,
    rankings: keywords,
  };
}

/**
 * Generate prioritized action items based on audit results
 */
function generateActionItems(auditData, gmbScore, citationScore) {
  const items = [];

  // GMB Completeness issues
  if (gmbScore < 100) {
    const gmbIssues = [];

    if (!auditData.gmbData.descriptionComplete) {
      gmbIssues.push({
        task: 'Complete business description with target keywords (750+ characters)',
        priority: 'high',
        status: 'pending',
        category: 'GMB Completeness',
      });
    }

    if (!auditData.gmbData.hoursUpdated) {
      gmbIssues.push({
        task: 'Verify and update business hours (including special hours)',
        priority: 'high',
        status: 'pending',
        category: 'GMB Completeness',
      });
    }

    if (auditData.gmbData.photosCount < 7) {
      gmbIssues.push({
        task: `Add more photos (currently ${auditData.gmbData.photosCount}, recommended 7+)`,
        priority: 'medium',
        status: 'pending',
        category: 'Media',
      });
    }

    if (!auditData.gmbData.servicesComplete) {
      gmbIssues.push({
        task: 'Complete services list with descriptions and pricing',
        priority: 'high',
        status: 'pending',
        category: 'Services',
      });
    }

    if (!auditData.gmbData.recentPost) {
      gmbIssues.push({
        task: 'Post a "What\'s New" update to GMB (recency signal for Google)',
        priority: 'high',
        status: 'pending',
        category: 'Recency Signal',
      });
    }

    if (!auditData.gmbData.reviewsResponded) {
      gmbIssues.push({
        task: 'Respond to all recent reviews (positive and negative)',
        priority: 'high',
        status: 'pending',
        category: 'Engagement',
      });
    }

    items.push(...gmbIssues);
  }

  // Citation consistency issues
  if (citationScore < 100) {
    const inconsistentCitations = auditData.citations.filter(c => !c.consistent);

    if (inconsistentCitations.length > 0) {
      items.push({
        task: `Ensure NAP consistency on: ${inconsistentCitations.map(c => c.name).join(', ')}`,
        priority: 'high',
        status: 'pending',
        category: 'NAP Consistency',
      });
    }

    const missingCitations = auditData.citations.filter(c => !c.found && c.required);
    if (missingCitations.length > 0) {
      items.push({
        task: `Add business to: ${missingCitations.map(c => c.name).join(', ')}`,
        priority: 'medium',
        status: 'pending',
        category: 'Citations',
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return items;
}

/**
 * Get SEO recommendations based on industry and current scores
 */
function getSEORecommendations(gmbScore, citationScore, industry) {
  const recommendations = [];

  if (gmbScore < 70) {
    recommendations.push({
      category: 'GMB Optimization',
      tips: [
        'Complete every field in your Google Business Profile',
        'Upload high-quality photos regularly (exterior, interior, team, products)',
        'Post updates at least weekly to improve recency signals',
        'Respond to all reviews within 24-48 hours',
      ],
    });
  }

  if (citationScore < 70) {
    recommendations.push({
      category: 'Local Citations',
      tips: [
        'Ensure NAP (Name, Address, Phone) is identical across all directories',
        'Claim and verify all major citation sources',
        'Use a local citation builder service for consistent distribution',
        'Monitor citation changes with alerts',
      ],
    });
  }

  // Industry-specific recommendations
  const industryRecs = {
    restaurant: [
      'Add menu items and photos to your GMB listing',
      'Encourage customers to check in on Google',
      'Respond to food-related reviews with specific details',
    ],
    clinic: [
      'Add credentials and certifications to your listing',
      'Highlight services and accepted insurance plans',
      'Share educational health tips via GMB posts',
    ],
    salon: [
      'Upload before/after photos of hairstyles',
      'List specific services with pricing ranges',
      'Share styling tips and trend content',
    ],
    gym: [
      'Add class schedules and trainer bios',
      'Showcase facility amenities in photos',
      'Share member success stories (with permission)',
    ],
    hotel: [
      'Add room types and amenity details',
      'Highlight local area attractions',
      'Share guest testimonials and reviews',
    ],
  };

  const specificRecs = industryRecs[industry] || industryRecs.default;
  recommendations.push({
    category: `${industry} Specific`,
    tips: specificRecs,
  });

  return recommendations;
}

/**
 * Get competitor insights for local SEO
 * (Placeholder - would need actual competitor data)
 */
async function getCompetitorInsights(location, industry) {
  return {
    competitorsAnalyzed: 3,
    averageRating: (4 + Math.random()).toFixed(1),
    averageReviewCount: Math.floor(Math.random() * 100) + 10,
    topKeywords: [
      `${industry} in ${location}`,
      `best ${industry} ${location}`,
      `${industry} near me`,
    ],
    gaps: [
      'Some competitors are more active on Google Posts',
      'Review response time could be improved across the market',
      'Photo quantity is below average for top performers',
    ],
    opportunities: [
      'Local link building from neighborhood blogs',
      'Schema markup for service areas',
      'Voice search optimization for "near me" queries',
    ],
  };
}

/**
 * Monitor citation changes over time
 */
async function monitorCitationHealth(accountId, businessData) {
  // In production, track citations over time and alert on changes
  
  const currentCitations = CITATION_SOURCES.map(source => ({
    ...source,
    status: Math.random() > 0.2 ? 'consistent' : 'needs_review',
    lastChecked: new Date().toISOString(),
  }));

  return {
    totalCitations: currentCitations.length,
    consistent: currentCitations.filter(c => c.status === 'consistent').length,
    needsReview: currentCitations.filter(c => c.status === 'needs_review').length,
    citations: currentCitations,
  };
}

/**
 * Get SEO audit history for a business
 */
async function getAuditHistory(businessId, limit = 10) {
  const audits = await prisma.sEOAudit.findMany({
    where: { businessId },
    orderBy: { lastAuditedAt: 'desc' },
    take: limit,
  });

  // Calculate trend (compare latest to previous)
  let trend = 'stable';
  if (audits.length >= 2) {
    const latestScore = audits[0].seoHealthScore;
    const previousScore = audits[1].seoHealthScore;
    const diff = latestScore - previousScore;
    
    if (diff > 5) trend = 'improving';
    else if (diff < -5) trend = 'declining';
  }

  return {
    audits,
    trend,
    lastAuditDate: audits[0]?.lastAuditedAt,
  };
}

module.exports = {
  // Core audit functions
  runSEOAudit,
  getSEORecommendations,
  getCompetitorInsights,
  monitorCitationHealth,
  getAuditHistory,

  // Helper functions
  calculateGMBCompletenessScore,
  calculateCitationConsistencyScore,
  analyzeLocalKeywordRankings,
  generateActionItems,

  // Constants
  GMB_CHECKLIST,
  CITATION_SOURCES,
};