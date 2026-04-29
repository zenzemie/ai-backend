/**
 * Social Media Service
 * Handles Meta Graph API (Instagram/Facebook) and LinkedIn API integrations for automated posting
 * Part of System #7 - AI Social Media & SEO Growth
 */
const logger = require('./logger');
const prisma = require('../config/prisma');
const openaiService = require('./openaiService');

// ============================================
// META GRAPH API (Instagram/Facebook)
// ============================================

/**
 * Meta Graph API configuration
 */
const META_CONFIG = {
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com',
};

/**
 * LinkedIn API configuration
 */
const LINKEDIN_CONFIG = {
  baseUrl: 'https://api.linkedin.com/v2',
};

/**
 * Content pillars by industry for AI generation
 */
const CONTENT_PILLARS = {
  restaurant: {
    types: ['food_photography', 'behind_the_scenes', 'menu_highlights', 'customer_testimonials'],
    hooks: [
      'The secret behind {DishName}...',
      'Our kitchen is heating up!',
      'Why {City} loves our {DishName}',
    ],
  },
  clinic: {
    types: ['educational_tips', 'patient_testimonials', 'safety_standards', 'procedure_explanations'],
    hooks: [
      'Health tip of the week: {Tip}',
      'Why {Procedure} changes lives',
      'What our patients say about {Treatment}',
    ],
  },
  salon: {
    types: ['transformations', 'styling_tips', 'product_spotlights', 'stylist_profiles'],
    hooks: [
      'Get the look you\'ve always wanted',
      'Meet our stylist {Name}',
      'The {Style} trend is here — here\'s how to get it',
    ],
  },
  gym: {
    types: ['workout_clips', 'nutrition_guides', 'success_stories', 'motivation_quotes'],
    hooks: [
      'Crush your {Goal} goals',
      'Monday motivation: {Quote}',
      'What {DaysAgo} looked like → What today looks like',
    ],
  },
  hotel: {
    types: ['guest_experiences', 'amenity_showcases', 'local_guides', 'seasonal_highlights'],
    hooks: [
      'Wake up to {Experience}',
      'Your stay, reimagined',
      'Why guests keep coming back to {City}',
    ],
  },
  courier: {
    types: ['delivery_speed', 'reliability_content', 'customer_wins', 'faq_content'],
    hooks: [
      'Your package in record time',
      'Why {City} trusts us',
      'When reliability is everything',
    ],
  },
  default: {
    types: ['tips', 'behind_the_scenes', 'testimonials', 'promotions'],
    hooks: [
      'Here\'s what makes us different',
      'Meet the team behind {BusinessName}',
      'Why our clients love us',
    ],
  },
};

/**
 * Industry detection helper
 */
function detectIndustry(businessData) {
  const industry = (businessData.industry || '').toLowerCase();
  
  if (industry.includes('restaurant') || industry.includes('cafe') || industry.includes('food')) return 'restaurant';
  if (industry.includes('clinic') || industry.includes('medical') || industry.includes('doctor')) return 'clinic';
  if (industry.includes('salon') || industry.includes('spa') || industry.includes('beauty')) return 'salon';
  if (industry.includes('gym') || industry.includes('fitness') || industry.includes('health')) return 'gym';
  if (industry.includes('hotel') || industry.includes('hospitality')) return 'hotel';
  if (industry.includes('courier') || industry.includes('delivery') || industry.includes('logistics')) return 'courier';
  
  return 'default';
}

/**
 * Generate AI-powered social media content
 * @param {Object} params - Content generation parameters
 * @returns {Object} Generated content with caption, hashtags, and media suggestions
 */
async function generateSocialContent(params) {
  const {
    businessId,
    businessData,
    platform = 'INSTAGRAM',
    contentType = 'general',
    tone = 'professional',
    industryContext,
  } = params;

  const industry = industryContext || detectIndustry(businessData);
  const pillar = CONTENT_PILLARS[industry] || CONTENT_PILLARS.default;

  // Build prompt for OpenAI
  const systemPrompt = `You are an elite social media content strategist for LeadForge AI.
Your goal is to generate engaging, platform-specific social media content that feels authentic and human.

Platform: ${platform}
Industry: ${industry}
Content Type: ${contentType}
Tone: ${tone}

Available Content Types for ${industry}:
${pillar.types.map(t => `- ${t}`).join('\n')}

Content Hooks to use:
${pillar.hooks.map(h => `- ${h}`).join('\n')}

Requirements:
- Content must feel native to the platform (not generic or spammy)
- Include relevant hashtags (3-7)
- ${platform === 'INSTAGRAM' ? 'Use visual storytelling cues, include caption structure with hook/middle/cta' : ''}
- ${platform === 'LINKEDIN' ? 'Professional tone, industry insights, thought leadership angle' : ''}
- ${platform === 'FACEBOOK' ? 'Community-focused, shareable, conversation-starter' : ''}
- ${platform === 'TIKTOK' ? 'Hook in first 3 seconds, trending audio suggestions, short punchy text' : ''}

Return a JSON object with:
{
  "caption": "Main post caption (150-300 words for Instagram, shorter for TikTok)",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "mediaSuggestion": "Description of what visual content to create (photo, video, carousel)",
  "hookText": "First line to hook the reader (only for short-form platforms)",
  "ctaText": "Call-to-action text"
}`;

  const userPrompt = `Generate content for ${businessData?.name || 'a business'}.
${businessData?.description ? `Business description: ${businessData.description}` : ''}
${contentType === 'review_repost' ? 'This is a 5-star review to be repurposed into a post.' : ''}`;

  try {
    const response = await openaiService.generateContent(
      `Generate ${platform} content for a ${industry} business. Business: ${JSON.stringify(businessData)}. Platform: ${platform}, Type: ${contentType}`
    );

    // Parse response - try JSON first, then fallback to text processing
    let parsedContent;
    try {
      parsedContent = JSON.parse(response);
    } catch {
      // Fallback: create structured content from raw response
      parsedContent = {
        caption: response,
        hashtags: generateHashtags(industry, businessData?.name),
        mediaSuggestion: 'High-quality photo or video',
        hookText: response.substring(0, 50) + '...',
        ctaText: 'Learn more via link in bio',
      };
    }

    logger.info('Social content generated', { businessId, platform, contentType });

    return {
      success: true,
      content: parsedContent,
      platform,
      contentType,
      industry,
    };
  } catch (error) {
    logger.error('Social content generation failed', { error: error.message });
    throw error;
  }
}

/**
 * Generate hashtags based on industry
 */
function generateHashtags(industry, businessName) {
  const baseHashtags = [
    `#${industry.replace('_', '')}`,
    '#localbusiness',
    '#smallbusiness',
    '#growth',
  ];

  if (businessName) {
    const nameTag = businessName.replace(/\s+/g, '');
    if (nameTag.length > 2) {
      baseHashtags.push(`#${nameTag}`);
    }
  }

  return baseHashtags.slice(0, 7);
}

/**
 * Post content to Meta (Instagram/Facebook)
 * @param {Object} params - Post parameters
 * @returns {Object} Post result
 */
async function postToMeta(params) {
  const {
    accessToken,
    accountId,
    platform, // INSTAGRAM or FACEBOOK
    content,
    mediaUrl,
    scheduledAt,
  } = params;

  if (!accessToken || accessToken === 'dummy-meta-token') {
    logger.warn('Meta access token not configured, simulating post');
    return simulateSocialPost(platform, content);
  }

  try {
    const endpoint = platform === 'INSTAGRAM' 
      ? `/${META_CONFIG.apiVersion}/${accountId}/media`
      : `/${META_CONFIG.apiVersion}/${accountId}/feed`;

    // Prepare post payload
    const payload = {
      message: content.caption,
      access_token: accessToken,
    };

    if (mediaUrl) {
      payload.url = mediaUrl;
    }

    // For now, simulate the API call
    logger.info('Posting to Meta', { platform, accountId, contentLength: content.caption.length });

    // In production, this would make actual API calls:
    // const response = await fetch(`${META_CONFIG.baseUrl}${endpoint}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });

    return {
      success: true,
      postId: `meta_${Date.now()}`,
      platform,
      postedAt: new Date().toISOString(),
      mock: true, // Indicates this is simulated
    };
  } catch (error) {
    logger.error('Meta posting failed', { error: error.message });
    throw error;
  }
}

/**
 * Post content to LinkedIn
 * @param {Object} params - Post parameters
 * @returns {Object} Post result
 */
async function postToLinkedIn(params) {
  const {
    accessToken,
    companyId,
    content,
    mediaUrl,
    scheduledAt,
  } = params;

  if (!accessToken || accessToken === 'dummy-linkedin-token') {
    logger.warn('LinkedIn access token not configured, simulating post');
    return simulateSocialPost('LINKEDIN', content);
  }

  try {
    logger.info('Posting to LinkedIn', { companyId, contentLength: content.caption.length });

    // In production, use LinkedIn API:
    // POST https://api.linkedin.com/v2/ugcPosts

    return {
      success: true,
      postId: `li_${Date.now()}`,
      platform: 'LINKEDIN',
      postedAt: new Date().toISOString(),
      mock: true,
    };
  } catch (error) {
    logger.error('LinkedIn posting failed', { error: error.message });
    throw error;
  }
}

/**
 * Simulate a social post (when API not configured)
 */
function simulateSocialPost(platform, content) {
  logger.info(`Simulating ${platform} post`, { contentLength: content.caption?.length || 0 });

  return {
    success: true,
    postId: `${platform.toLowerCase()}_${Date.now()}`,
    platform,
    postedAt: new Date().toISOString(),
    simulated: true,
  };
}

// ============================================
// REVIEW-TO-POST REPURPOSING WORKFLOW
// ============================================

/**
 * Review-to-Post repurposing workflow
 * Trigger: New 5-star review -> AI Content Generation -> Social Post
 * @param {Object} review - The 5-star review to repurpose
 * @param {Object} businessData - Business context
 * @returns {Object} Created social post
 */
async function repurposerReviewToPost(review, businessData) {
  logger.info('Review-to-Post workflow triggered', { 
    reviewId: review.id, 
    rating: review.rating,
    reviewerName: review.reviewerName 
  });

  // Only process 5-star reviews
  if (review.rating < 5) {
    logger.info('Review not 5-star, skipping repurposing', { rating: review.rating });
    return { skipped: true, reason: 'Not a 5-star review' };
  }

  try {
    // Step 1: Generate social content from review
    const generatedContent = await generateSocialContent({
      businessId: review.businessId,
      businessData: {
        ...businessData,
        name: review.businessName || businessData?.name,
      },
      platform: 'INSTAGRAM',
      contentType: 'review_repost',
      tone: 'grateful',
      industryContext: detectIndustry(businessData),
    });

    // Step 2: Create social post draft in database
    const socialPost = await prisma.socialPost.create({
      data: {
        businessId: review.businessId,
        platform: 'INSTAGRAM',
        content: JSON.stringify({
          caption: generatedContent.content.caption,
          hashtags: generatedContent.content.hashtags,
          hookText: generatedContent.content.hookText,
          ctaText: generatedContent.content.ctaText,
        }),
        mediaUrl: null, // In production, would generate graphic here
        status: 'draft',
        sourceReviewId: review.id,
        accountId: review.accountId || businessData?.accountId || 'default',
      },
    });

    // Step 3: Emit trigger for auto-posting (if auto-approval enabled)
    const triggerService = require('./automation/triggerService');
    triggerService.triggerEmitter.emit('review_repost_created', {
      socialPostId: socialPost.id,
      reviewId: review.id,
      content: generatedContent.content,
    });

    logger.info('Review repurposed to social post', { 
      socialPostId: socialPost.id,
      reviewId: review.id 
    });

    return {
      success: true,
      socialPostId: socialPost.id,
      content: generatedContent.content,
    };
  } catch (error) {
    logger.error('Review-to-Post repurposing failed', { error: error.message });
    throw error;
  }
}

/**
 * Auto-post review repurposed content (with optional approval)
 * @param {string} socialPostId - The social post ID
 * @param {boolean} autoApprove - Whether to auto-post without approval
 */
async function autoPostRepurposedContent(socialPostId, autoApprove = false) {
  const post = await prisma.socialPost.findUnique({
    where: { id: socialPostId },
  });

  if (!post) {
    throw new Error('Social post not found');
  }

  if (post.status !== 'draft') {
    return { skipped: true, reason: 'Post not in draft status' };
  }

  // Check if auto-approval is enabled (in production, check account settings)
  if (!autoApprove) {
    logger.info('Auto-approval disabled, post requires manual approval');
    return { requiresApproval: true, postId: socialPostId };
  }

  // Publish the post
  const publishResult = await publishSocialPost({
    ...post,
    content: JSON.parse(post.content),
  });

  return publishResult;
}

// ============================================
// SOCIAL POST PUBLISHING
// ============================================

/**
 * Publish a social post to the specified platform
 * @param {Object} postData - Post data with content and platform info
 */
async function publishSocialPost(postData) {
  const { platform, content, mediaUrl, accessTokens } = postData;
  
  let result;

  try {
    switch (platform) {
      case 'INSTAGRAM':
      case 'FACEBOOK':
        result = await postToMeta({
          accessToken: accessTokens?.meta,
          accountId: accessTokens?.metaAccountId,
          platform,
          content,
          mediaUrl,
        });
        break;
      
      case 'LINKEDIN':
        result = await postToLinkedIn({
          accessToken: accessTokens?.linkedin,
          companyId: accessTokens?.linkedinCompanyId,
          content,
          mediaUrl,
        });
        break;
      
      case 'GOOGLE_BUSINESS':
        // In production, use Google Business Profile API
        result = simulateSocialPost('GOOGLE_BUSINESS', content);
        break;
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Update post status in database
    await prisma.socialPost.update({
      where: { id: postData.id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    logger.info('Social post published', { 
      postId: postData.id, 
      platform,
      postIdExternal: result.postId 
    });

    return {
      success: true,
      postId: postData.id,
      platform,
      externalPostId: result.postId,
      publishedAt: result.postedAt,
    };
  } catch (error) {
    logger.error('Social post publishing failed', { error: error.message, platform });

    // Update post status to failed
    if (postData.id) {
      await prisma.socialPost.update({
        where: { id: postData.id },
        data: { status: 'failed' },
      });
    }

    throw error;
  }
}

/**
 * Schedule a social post for later
 * @param {Object} postData - Post data with scheduledAt timestamp
 */
async function scheduleSocialPost(postData) {
  const { scheduledAt, ...rest } = postData;

  const post = await prisma.socialPost.create({
    data: {
      ...rest,
      status: 'scheduled',
      scheduledAt: new Date(scheduledAt),
    },
  });

  logger.info('Social post scheduled', { postId: post.id, scheduledAt });

  return { success: true, postId: post.id, scheduledAt };
}

// ============================================
// SOCIAL MEDIA ANALYTICS
// ============================================

/**
 * Get social media analytics for an account
 * @param {string} accountId - Account ID
 * @param {Object} options - Query options (date range, platform)
 * @returns {Object} Analytics data
 */
async function getSocialAnalytics(accountId, options = {}) {
  const { startDate, endDate, platform } = options;

  const where = {
    accountId,
    status: 'published',
  };

  if (startDate || endDate) {
    where.publishedAt = {};
    if (startDate) where.publishedAt.gte = new Date(startDate);
    if (endDate) where.publishedAt.lte = new Date(endDate);
  }

  if (platform) where.platform = platform;

  const posts = await prisma.socialPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });

  // Calculate aggregate metrics
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.sharesCount || 0), 0);
  const totalReach = posts.reduce((sum, p) => sum + (p.reachCount || 0), 0);

  // Calculate engagement rate
  const totalEngagements = totalLikes + totalComments + totalShares;
  const engagementRate = totalReach > 0 
    ? ((totalEngagements / totalReach) * 100).toFixed(2)
    : '0';

  // Group by platform
  const postsByPlatform = {};
  posts.forEach(post => {
    if (!postsByPlatform[post.platform]) {
      postsByPlatform[post.platform] = {
        count: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        engagement: 0,
      };
    }
    postsByPlatform[post.platform].count++;
    postsByPlatform[post.platform].likes += post.likesCount || 0;
    postsByPlatform[post.platform].comments += post.commentsCount || 0;
    postsByPlatform[post.platform].shares += post.sharesCount || 0;
    postsByPlatform[post.platform].reach += post.reachCount || 0;
    postsByPlatform[post.platform].engagement += (post.likesCount || 0) + (post.commentsCount || 0) + (post.sharesCount || 0);
  });

  // Calculate follower growth (placeholder - would need historical data)
  const followerGrowth = {
    instagram: '+0',
    facebook: '+0',
    linkedin: '+0',
  };

  // Get top performing posts
  const topPosts = posts
    .map(post => ({
      id: post.id,
      platform: post.platform,
      publishedAt: post.publishedAt,
      engagement: (post.likesCount || 0) + (post.commentsCount || 0) + (post.sharesCount || 0),
      reach: post.reachCount || 0,
      content: post.content?.substring(0, 100) + '...',
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5);

  return {
    summary: {
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalReach,
      engagementRate,
    },
    postsByPlatform,
    followerGrowth,
    topPosts,
    period: { startDate, endDate },
  };
}

// ============================================
// OPTIMAL SEND TIMES
// ============================================

/**
 * Get optimal send times for a platform and industry
 * @param {string} platform - Social platform
 * @param {string} industry - Business industry
 * @returns {Array} Array of optimal time windows
 */
function getOptimalSendTimes(platform, industry) {
  // Default optimal times by platform
  const defaultTimes = {
    INSTAGRAM: [
      { day: 'Monday', time: '9:00 AM' },
      { day: 'Wednesday', time: '12:00 PM' },
      { day: 'Friday', time: '5:00 PM' },
      { day: 'Saturday', time: '10:00 AM' },
    ],
    FACEBOOK: [
      { day: 'Tuesday', time: '10:00 AM' },
      { day: 'Thursday', time: '1:00 PM' },
      { day: 'Saturday', time: '12:00 PM' },
    ],
    LINKEDIN: [
      { day: 'Tuesday', time: '8:00 AM' },
      { day: 'Wednesday', time: '9:00 AM' },
      { day: 'Thursday', time: '10:00 AM' },
    ],
    TIKTOK: [
      { day: 'Tuesday', time: '7:00 PM' },
      { day: 'Thursday', time: '7:00 PM' },
      { day: 'Saturday', time: '12:00 PM' },
    ],
  };

  return defaultTimes[platform] || defaultTimes.INSTAGRAM;
}

module.exports = {
  // Content generation
  generateSocialContent,
  generateHashtags,
  detectIndustry,
  CONTENT_PILLARS,

  // Platform posting
  postToMeta,
  postToLinkedIn,
  publishSocialPost,
  scheduleSocialPost,

  // Review-to-Post repurposing
  repurposerReviewToPost,
  autoPostRepurposedContent,

  // Analytics
  getSocialAnalytics,

  // Utilities
  getOptimalSendTimes,
};