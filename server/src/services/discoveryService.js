const axios = require('axios');
const cheerio = require('cheerio');

const YELP_API_KEY = process.env.YELP_API_KEY;

/**
 * Search for businesses using Yelp Fusion API
 */
const searchBusinesses = async (term, location) => {
  // Mock Data Fallback for Development
  if (!YELP_API_KEY || YELP_API_KEY.includes('dummy')) {
    console.warn('Using MOCK Yelp data - No API key found');
    return [
      {
        id: 'mock-1',
        name: 'The Elite Dental Clinic',
        url: '',
        display_phone: '+44 20 7123 4567',
        rating: 4.8,
        review_count: 12,
        transactions: [],
        categories: [{ alias: 'dentists' }]
      },
      {
        id: 'mock-2',
        name: 'Glow Up Hair Salon',
        url: 'https://glowupsalon.example.com',
        display_phone: '+44 20 8987 6543',
        rating: 3.2,
        review_count: 150,
        transactions: ['pickup'],
        categories: [{ alias: 'hair' }]
      },
      {
        id: 'mock-3',
        name: 'Standard Burger Joint',
        url: 'https://standardburger.yelp.com',
        display_phone: '+44 20 5555 0101',
        rating: 4.1,
        review_count: 45,
        transactions: ['delivery', 'pickup'],
        categories: [{ alias: 'burgers' }]
      }
    ];
  }

  try {
    const response = await axios.get(
      'https://api.yelp.com/v3/businesses/search',
      {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
        },
        params: {
          term: term,
          location: location,
          limit: 20, // Increased limit
        },
      }
    );
    return response.data.businesses;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('Yelp API Rate Limit Exceeded');
      throw new Error('Search rate limit reached. Please try again later.');
    }
    console.error('Error in searchBusinesses (Yelp):', error.response?.data || error.message);
    throw new Error('Failed to fetch businesses from Yelp.');
  }
};

/**
 * Crawl website for contact information (Email, Social Links)
 */
const crawlWebsite = async (url) => {
  if (!url || url === '' || url.includes('yelp.com')) {
    return { email: null, instagram: null, facebook: null };
  }
  
  let cleanUrl = url;
  if (!url.startsWith('http')) {
    cleanUrl = `https://${url}`;
  }

  try {
    const response = await axios.get(cleanUrl, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text();
    
    // 1. Find Email
    let email = null;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = bodyText.match(emailRegex);
    if (emailMatches && emailMatches.length > 0) {
      email = emailMatches[0];
    } else {
      const mailto = $('a[href^="mailto:"]').attr('href');
      if (mailto) {
        email = mailto.replace('mailto:', '').split('?')[0];
      }
    }
    
    // 2. Find Social Links
    let instagram = null;
    let facebook = null;
    
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('instagram.com/')) {
        instagram = href;
      }
      if (href && href.includes('facebook.com/')) {
        facebook = href;
      }
    });

    return { email, instagram, facebook };
  } catch (error) {
    console.warn(`Could not crawl website ${url}:`, error.message);
    return { email: null, instagram: null, facebook: null };
  }
};

/**
 * Basic email crawler (Legacy/Simple)
 */
const findEmailFromWebsite = async (url) => {
  const info = await crawlWebsite(url);
  return info.email;
};

/**
 * Operation Black Forge - Advanced Scoring Logic
 * Final Rank = (Automation Need Score * 0.6) + (Industry Tier Weight * 0.4)
 */
const calculateLeadMetrics = (business, industryCategory) => {
  let needScore = 0;
  let industryTier = 3;
  let industryTierWeight = 40;
  
  // 1. Calculate Need Score
  // Missing Website (+40)
  const isMissingWebsite = !business.url || business.url.includes('yelp.com') || business.url === '';
  if (isMissingWebsite) {
    needScore += 40;
  }
  
  // No Online Booking (+30) 
  // Yelp 'transactions' field: pickup, delivery, restaurant_reservation
  const transactions = business.transactions || [];
  const hasOnlineBooking = transactions.includes('pickup') || 
                           transactions.includes('delivery') || 
                           transactions.includes('restaurant_reservation');
  
  if (!hasOnlineBooking) {
    needScore += 30;
  }
  
  // Low Rating (< 3.5) (+20)
  if (business.rating && business.rating < 3.5) {
    needScore += 20;
  }
  
  // Low Review Count (< 30) (+10)
  if (business.review_count !== undefined && business.review_count < 30) {
    needScore += 10;
  }
  
  // Social Presence Proxy (+10)
  // If no website, likely no strong social presence links found easily
  if (isMissingWebsite) {
    needScore += 10;
  }
  
  needScore = Math.min(needScore, 100);

  // 2. Determine Industry Tier
  const tier1 = ['medical', 'dental', 'clinic', 'lawyer', 'attorney', 'accountant', 'physio', 'chiro', 'legal', 'healthcare'];
  const tier2 = ['salon', 'hair', 'gym', 'fitness', 'wellness', 'restaurant', 'cafe', 'hotel', 'spa'];
  
  const cat = (industryCategory || '').toLowerCase();
  const businessCategories = (business.categories || []).map(c => c.alias.toLowerCase());
  
  const isTier1 = tier1.some(t => cat.includes(t)) || businessCategories.some(bc => tier1.some(t => bc.includes(t)));
  const isTier2 = tier2.some(t => cat.includes(t)) || businessCategories.some(bc => tier2.some(t => bc.includes(t)));

  if (isTier1) {
    industryTier = 1;
    industryTierWeight = 100;
  } else if (isTier2) {
    industryTier = 2;
    industryTierWeight = 70;
  }

  // 3. Calculate Final Opportunity Score
  const opportunityScore = Math.round((needScore * 0.6) + (industryTierWeight * 0.4));

  // 4. Logic Triggers (Implementation Markers)
  
  // Urgency Marker: High rating but low review count (Needs reviews now)
  const hasUrgencyMarker = business.rating >= 4.2 && business.review_count < 25;
  
  // Efficiency Marker: Reservable-type business but no online booking
  const reservableIndustries = ['restaurant', 'salon', 'clinic', 'dentist', 'physio', 'spa'];
  const isReservableType = reservableIndustries.some(t => cat.includes(t)) || businessCategories.some(bc => reservableIndustries.some(t => bc.includes(t)));
  const hasEfficiencyMarker = isReservableType && !hasOnlineBooking;
  
  // Recovery Marker: Low rating (Needs reputation repair)
  const hasRecoveryMarker = business.rating && business.rating < 3.2;

  // Urgency Level
  let urgency = 'LOW';
  if (opportunityScore > 85 || hasUrgencyMarker) urgency = 'CRITICAL';
  else if (opportunityScore > 70) urgency = 'HIGH';
  else if (opportunityScore > 50) urgency = 'MEDIUM';

  return {
    automationNeedScore: needScore,
    industryTier,
    opportunityScore,
    hasUrgencyMarker,
    hasEfficiencyMarker,
    hasRecoveryMarker,
    urgency,
    revenuePotential: industryTier === 1 ? 'HIGH' : industryTier === 2 ? 'MEDIUM' : 'LOW'
  };
};

module.exports = {
  searchBusinesses,
  findEmailFromWebsite,
  calculateLeadMetrics,
  crawlWebsite,
};
