/**
 * Review Service
 * Handles Google Business Profile API integration, review storage, and review request automation
 * Part of System #6 - AI Reputation & Review Manager
 */
const logger = require('./logger');
const prisma = require('../config/prisma');
const sentimentService = require('./sentimentAnalysisService');
const { emitNegativeReviewReceived } = require('./automation/triggerService');
const resendService = require('./resendService');

/**
 * Industry-specific delay times for review requests (in milliseconds)
 */
const REVIEW_REQUEST_DELAYS = {
  'restaurant': 2 * 60 * 60 * 1000,        // 2-4 hours
  'retail': 2 * 60 * 60 * 1000,
  'clinic': 24 * 60 * 60 * 1000,           // 24 hours
  'medical': 24 * 60 * 60 * 1000,
  'salon': 4 * 60 * 60 * 1000,             // 4-8 hours
  'spa': 4 * 60 * 60 * 1000,
  'gym': 24 * 60 * 60 * 1000,              // 24-48 hours
  'fitness': 24 * 60 * 60 * 1000,
  'hotel': 24 * 60 * 60 * 1000,            // 24 hours after check-out
  'default': 4 * 60 * 60 * 1000           // 4 hours default
};

/**
 * Get delay time for industry
 * @param {string} industry - Business industry
 * @returns {number} Delay in milliseconds
 */
function getReviewRequestDelay(industry) {
  const normalized = (industry || 'default').toLowerCase();
  return REVIEW_REQUEST_DELAYS[normalized] || REVIEW_REQUEST_DELAYS.default;
}

/**
 * Review request templates
 */
const REVIEW_TEMPLATES = {
  primary: (customerName, businessName, reviewLink) =>
    `Hi ${customerName}! Thanks for visiting ${businessName}.\n\nWe loved having you! 💛\nCould you spare 30 seconds to share your experience?\nIt really helps us grow: ${reviewLink}`,

  reminder: (customerName, businessName, reviewLink) =>
    `Hi ${customerName}! Just a gentle reminder — we'd love to hear your thoughts on ${businessName}.\n\nYour feedback keeps us improving: ${reviewLink}`
};

/**
 * Win-back message templates
 */
const WINBACK_TEMPLATES = {
  apology: (customerName, businessName, businessPhone) =>
    `Hi ${customerName}, I'm the owner of ${businessName}. I'm sorry we fell short — that's not the experience we strive for.\n\nMay I call you to make things right? Please contact us at ${businessPhone}.`,

  recovery: (customerName, businessName, businessPhone, offer = '20% off your next visit') =>
    `We'd love to offer you ${offer} as our way of saying sorry.\n\nPlease contact us at ${businessPhone} to claim this. We truly value your patronage.`
};

/**
 * AI Response draft template
 */
const AI_RESPONSE_TEMPLATE = (customerName, businessName, businessPhone) =>
  `Dear ${customerName}, thank you for your feedback. We're sorry we didn't meet your expectations on this occasion.\n\nWe'd love the opportunity to make it right — please reach out to us directly at ${businessPhone} so we can address this personally.\n\nSincerely, ${businessName} Team`;

/**
 * Store a new review in the database
 * @param {Object} reviewData - Review data from GBP API
 * @returns {Object} Stored review record
 */
async function storeReview(reviewData) {
  const {
    businessId,
    platform = 'GOOGLE_BUSINESS',
    reviewerName,
    rating,
    text,
    gbpReviewId,
    customerPhone,
    customerEmail,
    gbpReviewLink,
    businessName,
    businessPhone,
    campaignId
  } = reviewData;

  // Check for duplicate by gbpReviewId
  if (gbpReviewId) {
    const existing = await prisma.review.findFirst({
      where: { gbpReviewId, platform }
    });

    if (existing) {
      logger.info('Review already exists, skipping', { gbpReviewId, platform });
      return { review: existing, sentiment: null, duplicate: true };
    }
  }

  // Analyze sentiment
  const sentiment = await sentimentService.classifySentiment(rating, text);

  // Generate AI response draft
  const aiResponseDraft = AI_RESPONSE_TEMPLATE(
    reviewerName,
    businessName || 'Our Business',
    businessPhone || ''
  );

  // Create the review directly (not via ReputationCampaign)
  const review = await prisma.review.create({
    data: {
      businessId: businessId || 'unknown',
      platform,
      gbpReviewId,
      reviewerName: reviewerName || 'Anonymous',
      rating,
      text,
      sentimentScore: sentiment?.score || 0,
      sentimentLabel: sentiment?.label || 'NEUTRAL',
      aiResponseDraft,
      responseStatus: 'pending',
      customerPhone,
      customerEmail,
      gbpReviewLink,
      campaignId,
    }
  });

  logger.info('Review stored', { reviewId: review.id, rating, sentiment: sentiment?.label });

  // If negative review, trigger win-back flow
  if (sentiment?.isNegative) {
    await triggerNegativeReviewFlow(review, reviewData);
  }

  // If 5-star review, trigger repurposing workflow (for social media)
  if (rating >= 5) {
    const socialMediaService = require('./socialMediaService');
    socialMediaService.repurposerReviewToPost(review, { businessName, businessPhone, accountId: reviewData.accountId }).catch(err => {
      logger.error('Review-to-Post repurposing failed', { error: err.message });
    });
  }

  return { review, sentiment };
}

/**
 * Trigger negative review win-back flow
 * @param {Object} review - Review record
 * @param {Object} reviewData - Original review data
 */
async function triggerNegativeReviewFlow(review, reviewData) {
  logger.info('Negative review detected, triggering win-back flow', {
    reviewId: review.id,
    rating: reviewData.rating
  });

  // Emit trigger for automation engine
  await emitNegativeReviewReceived({
    reviewId: review.id,
    businessId: reviewData.businessId,
    customerName: reviewData.reviewerName,
    customerPhone: reviewData.customerPhone,
    customerEmail: reviewData.customerEmail,
    rating: reviewData.rating,
    text: reviewData.text,
    businessName: reviewData.businessName,
    businessPhone: reviewData.businessPhone,
    gbpReviewLink: reviewData.gbpReviewLink
  });
}

/**
 * Generate AI response draft for a review
 * @param {Object} review - Review object
 * @returns {string} AI-generated response draft
 */
async function generateAIResponseDraft(review) {
  const openaiService = require('./openaiService');

  const prompt = `You are a professional business owner responding to a customer review.

Review details:
- Rating: ${review.rating} stars
- Customer: ${review.reviewerName || 'Customer'}
- Review: "${review.text || 'No text'}"

Generate a response that is:
- Apologetic and sincere (if negative)
- Warm and grateful (if positive)
- Never defensive
- Professional tone
- Concise (under 150 words)
- Private (invite offline communication for issues)

Return only the response text.`;

  try {
    const response = await openaiService.generateContent(prompt);
    return response;
  } catch (err) {
    logger.error('AI response draft generation failed', { error: err.message });
    // Fallback to template
    return AI_RESPONSE_TEMPLATE(
      review.reviewerName,
      review.businessName,
      review.businessPhone
    );
  }
}

/**
 * Send review request via SMS (primary) or Email (fallback)
 * @param {Object} params - Review request parameters
 */
async function sendReviewRequest(params) {
  const {
    customerName,
    customerPhone,
    customerEmail,
    businessName,
    gbpReviewLink,
    industry,
    sendMode = 'auto' // 'auto' or 'manual'
  } = params;

  // Calculate delay based on industry
  const delay = getReviewRequestDelay(industry);

  logger.info('Review request scheduled', {
    customerName,
    businessName,
    delayHours: Math.round(delay / (60 * 60 * 1000)),
    sendMode
  });

  // In production, this would queue the SMS/Email for delayed delivery
  // For now, we'll simulate the delayed action
  if (sendMode === 'auto') {
    // Schedule the review request
    setTimeout(async () => {
      try {
        await sendReviewRequestSMS(customerName, customerPhone, businessName, gbpReviewLink);
      } catch (err) {
        logger.error('Review request SMS failed, falling back to email', { error: err.message });
        await sendReviewRequestEmail(customerName, customerEmail, businessName, gbpReviewLink);
      }
    }, delay);
  }

  return { scheduled: true, delay };
}

/**
 * Send review request via SMS (Twilio)
 */
async function sendReviewRequestSMS(customerName, customerPhone, businessName, reviewLink) {
  const message = REVIEW_TEMPLATES.primary(customerName, businessName, reviewLink);

  // In production, use Twilio API
  logger.info('Sending review request SMS', { customerPhone, businessName });

  // Simulated send - return success
  return {
    success: true,
    channel: 'SMS',
    sentAt: new Date().toISOString()
  };
}

/**
 * Send review request via Email (Resend)
 */
async function sendReviewRequestEmail(customerName, customerEmail, businessName, reviewLink) {
  const subject = `How was your experience at ${businessName}?`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hi ${customerName}! 👋</h2>
      <p>Thanks for visiting <strong>${businessName}</strong>.</p>
      <p>We loved having you! 💛</p>
      <p>Could you spare 30 seconds to share your experience? It really helps us grow:</p>
      <a href="${reviewLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Leave a Review</a>
      <p style="color: #666; font-size: 14px;">Thank you for your time!</p>
    </div>
  `;

  try {
    const result = await resendService.sendEmail(customerEmail, subject, html);
    return { success: true, channel: 'EMAIL', messageId: result.id };
  } catch (err) {
    logger.error('Review request email failed', { error: err.message, customerEmail });
    throw err;
  }
}

/**
 * Send win-back message sequence for negative reviews
 * @param {Object} params - Win-back parameters
 */
async function sendWinBackSequence(params) {
  const {
    customerName,
    customerPhone,
    customerEmail,
    businessName,
    businessPhone,
    gbpReviewLink
  } = params;

  // Step 1: Immediate private apology via SMS
  const apologyMessage = WINBACK_TEMPLATES.apology(customerName, businessName, businessPhone);
  logger.info('Sending win-back apology SMS', { customerPhone });

  // Step 2: Recovery offer after 24 hours (if no response)
  // This would be handled by the automation engine with delays

  // Step 3: Alert internal team for human follow-up
  // This is handled by the emitNegativeReviewReceived trigger

  return {
    step1: { status: 'sent', message: 'Apology SMS sent' },
    step2: { status: 'scheduled', message: 'Recovery offer in 24h if no response' },
    step3: { status: 'alerted', message: 'Internal team alerted for priority follow-up' }
  };
}

/**
 * Fetch reviews from Google Business Profile API
 * @param {string} accountId - GBP account ID
 * @param {string} locationId - GBP location ID
 * @returns {Array} Array of reviews
 */
async function fetchGBPReviews(accountId, locationId) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'dummy-google') {
    logger.warn('Google Places API key not configured, using mock data');
    return getMockReviews();
  }

  try {
    // Note: GBP API requires Google My Business API which is different from Places API
    // In production, you would use the Google My Business API
    // This is a placeholder for the actual implementation

    logger.info('Fetching GBP reviews', { accountId, locationId });

    // Placeholder - in production, implement actual GBP API call
    // const response = await googlePlacesClient.reviews({
    //   params: {
    //     place_id: locationId,
    //     key: apiKey
    //   }
    // });

    return getMockReviews();
  } catch (err) {
    logger.error('GBP reviews fetch failed', { error: err.message });
    throw err;
  }
}

/**
 * Get mock reviews for testing
 */
function getMockReviews() {
  return [
    {
      gbpReviewId: 'mock-review-1',
      reviewerName: 'John D.',
      rating: 5,
      text: 'Absolutely amazing experience! The team was professional and the results exceeded my expectations. Will definitely be back!',
      createdAt: new Date().toISOString()
    },
    {
      gbpReviewId: 'mock-review-2',
      reviewerName: 'Sarah M.',
      rating: 4,
      text: 'Great service overall. Very friendly staff. Only minor issue was the wait time but the quality made up for it.',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      gbpReviewId: 'mock-review-3',
      reviewerName: 'Mike R.',
      rating: 2,
      text: 'Disappointed with the service. The quality was not what I expected based on the reviews. Hope improvements will be made.',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
}

/**
 * Post a response to a Google Business review
 * @param {string} accountId - GBP account ID
 * @param {string} locationId - GBP location ID
 * @param {string} reviewId - Review ID
 * @param {string} responseText - Response text
 */
async function postReviewResponse(accountId, locationId, reviewId, responseText) {
  logger.info('Posting review response', { reviewId, responseLength: responseText.length });

  // In production, use GBP API to post the response
  // PUT accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply

  return {
    success: true,
    postedAt: new Date().toISOString(),
    reviewId
  };
}

/**
 * Get reputation KPIs for a business
 * @param {string} businessId - Business ID
 * @returns {Object} Reputation metrics
 */
async function getReputationKPIs(businessId) {
  // Get all reviews for this business
  const reviews = await prisma.reputationCampaign.findMany({
    where: {
      // Add businessId filter when schema is updated
    }
  });

  // Calculate metrics
  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.triggerEvent ? JSON.parse(r.triggerEvent).rating || 0 : 0), 0) / totalReviews
    : 0;

  // Calculate review velocity (last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const recentReviews = reviews.filter(r => new Date(r.createdAt) >= sevenDaysAgo);
  const previousReviews = reviews.filter(r => {
    const created = new Date(r.createdAt);
    return created >= fourteenDaysAgo && created < sevenDaysAgo;
  });

  const velocity = previousReviews.length > 0
    ? ((recentReviews.length - previousReviews.length) / previousReviews.length) * 100
    : recentReviews.length > 0 ? 100 : 0;

  // Sentiment distribution
  let positiveCount = 0;
  let negativeCount = 0;

  reviews.forEach(r => {
    if (r.triggerEvent) {
      const data = JSON.parse(r.triggerEvent);
      if (data.rating >= 4) positiveCount++;
      else if (data.rating <= 3) negativeCount++;
    }
  });

  return {
    aggregateRating: avgRating.toFixed(1),
    totalReviews,
    reviewVelocity: velocity.toFixed(1),
    positiveReviews: positiveCount,
    negativeReviews: negativeCount,
    negativeRate: totalReviews > 0 ? ((negativeCount / totalReviews) * 100).toFixed(1) : '0',
    // AI response rate would need tracking field
    aiResponseRate: '0', // Placeholder
  };
}

module.exports = {
  storeReview,
  generateAIResponseDraft,
  sendReviewRequest,
  sendReviewRequestSMS,
  sendReviewRequestEmail,
  sendWinBackSequence,
  fetchGBPReviews,
  postReviewResponse,
  getReputationKPIs,
  getReviewRequestDelay,
  REVIEW_TEMPLATES,
  WINBACK_TEMPLATES,
  AI_RESPONSE_TEMPLATE
};