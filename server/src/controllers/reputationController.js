/**
 * Reputation Controller
 * Handles HTTP requests for reputation management, reviews, and social media
 * Part of System #6 & #7 - AI Reputation & Review Manager + Social Media/SEO
 */
const reviewService = require('../services/reviewService');
const socialMediaService = require('../services/socialMediaService');
const seoAuditService = require('../services/seoAuditService');
const logger = require('../services/logger');
const prisma = require('../config/prisma');

/**
 * Get all reviews for the current account
 */
async function getReviews(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { platform, sentiment, limit = 50, offset = 0 } = req.query;

    const where = { accountId };

    if (platform) {
      where.platform = platform;
    }

    if (sentiment) {
      where.sentimentLabel = sentiment;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single review by ID
 */
async function getReviewById(req, res, next) {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Store a new review (from GBP webhook or polling)
 */
async function storeReview(req, res, next) {
  try {
    const {
      businessId,
      platform = 'GOOGLE_BUSINESS',
      gbpReviewId,
      reviewerName,
      rating,
      text,
      customerPhone,
      customerEmail,
      gbpReviewLink,
      businessName,
      businessPhone
    } = req.body;

    // Check for duplicate
    if (gbpReviewId) {
      const existing = await prisma.review.findFirst({
        where: { gbpReviewId, platform }
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          data: existing,
          message: 'Review already exists'
        });
      }
    }

    const result = await reviewService.storeReview({
      businessId,
      platform,
      gbpReviewId,
      reviewerName,
      rating,
      text,
      customerPhone,
      customerEmail,
      gbpReviewLink,
      businessName,
      businessPhone
    });

    res.status(201).json({
      success: true,
      data: result.review,
      sentiment: result.sentiment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate AI response draft for a review
 */
async function generateAIResponse(req, res, next) {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    const draft = await reviewService.generateAIResponseDraft(review);

    // Update the review with the draft
    await prisma.review.update({
      where: { id },
      data: {
        aiResponseDraft: draft,
        responseStatus: 'pending'
      }
    });

    res.json({
      success: true,
      data: {
        reviewId: id,
        aiResponseDraft: draft
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve and post AI response to review
 */
async function approveResponse(req, res, next) {
  try {
    const { id } = req.params;
    const { responseText, edited = false } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Use edited text or the existing draft
    const finalResponse = edited ? responseText : review.aiResponseDraft;

    if (!finalResponse) {
      return res.status(400).json({
        success: false,
        error: 'No response text provided. Generate an AI draft first.',
      });
    }

    // Post to Google Business Profile (or other platform)
    const postResult = await reviewService.postReviewResponse(
      review.businessId,
      review.gbpReviewId,
      finalResponse
    );

    // Update review status
    await prisma.review.update({
      where: { id },
      data: {
        aiResponseDraft: finalResponse,
        responseStatus: 'posted',
        responsePostedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        reviewId: id,
        responseStatus: 'posted',
        postedAt: postResult.postedAt
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Dismiss a review response (no action needed)
 */
async function dismissResponse(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.review.update({
      where: { id },
      data: {
        responseStatus: 'dismissed'
      }
    });

    res.json({
      success: true,
      message: 'Response dismissed'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Send review request (trigger review request flow)
 */
async function triggerReviewRequest(req, res, next) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      businessName,
      gbpReviewLink,
      industry
    } = req.body;

    if (!customerPhone && !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Either phone or email is required for review request'
      });
    }

    const result = await reviewService.sendReviewRequest({
      customerName,
      customerPhone,
      customerEmail,
      businessName,
      gbpReviewLink,
      industry,
      sendMode: 'auto'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Send win-back sequence for negative review
 */
async function triggerWinBack(req, res, next) {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (review.rating > 3) {
      return res.status(400).json({
        success: false,
        error: 'Win-back is only for negative reviews (rating <= 3)'
      });
    }

    const result = await reviewService.sendWinBackSequence({
      customerName: review.reviewerName,
      customerPhone: review.customerPhone,
      customerEmail: review.customerEmail,
      businessName: 'Your Business', // In production, get from context
      businessPhone: 'your-phone',   // In production, get from context
      gbpReviewLink: review.gbpReviewLink
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get reputation KPIs
 */
async function getReputationKPIs(req, res, next) {
  try {
    const { businessId } = req.query;

    const kpis = await reviewService.getReputationKPIs(businessId);

    res.json({
      success: true,
      data: kpis
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get review sentiment distribution
 */
async function getSentimentDistribution(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';

    const reviews = await prisma.review.findMany({
      where: { accountId },
      select: {
        sentimentLabel: true,
        rating: true
      }
    });

    const distribution = {
      VERY_NEGATIVE: reviews.filter(r => r.sentimentLabel === 'VERY_NEGATIVE').length,
      NEGATIVE: reviews.filter(r => r.sentimentLabel === 'NEGATIVE').length,
      NEUTRAL: reviews.filter(r => r.sentimentLabel === 'NEUTRAL').length,
      POSITIVE: reviews.filter(r => r.sentimentLabel === 'POSITIVE').length,
      VERY_POSITIVE: reviews.filter(r => r.sentimentLabel === 'VERY_POSITIVE').length,
    };

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        distribution,
        totalReviews: reviews.length,
        averageRating: avgRating.toFixed(1),
        negativeRate: reviews.length > 0
          ? ((distribution.NEGATIVE + distribution.VERY_NEGATIVE) / reviews.length * 100).toFixed(1)
          : '0'
      }
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// SOCIAL MEDIA & CONTENT (System #7)
// ============================================

/**
 * Get social posts for account
 */
async function getSocialPosts(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { platform, status, limit = 50 } = req.query;

    const where = { accountId };
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a social post draft
 */
async function createSocialPost(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const {
      businessId,
      platform,
      content,
      mediaUrl,
      scheduledAt
    } = req.body;

    const post = await prisma.socialPost.create({
      data: {
        businessId,
        platform,
        content,
        mediaUrl,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        accountId
      }
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate AI content for social post
 */
async function generateSocialContent(req, res, next) {
  try {
    const { businessId, businessContext, platform, contentType, tone, industry } = req.body;

    const content = await socialMediaService.generateSocialContent({
      businessId,
      businessData: { description: businessContext, name: businessContext, industry },
      platform: platform || 'INSTAGRAM',
      contentType: contentType || 'general',
      tone: tone || 'professional',
      industryContext: industry,
    });

    res.json({
      success: true,
      data: content
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Publish a social post
 */
async function publishSocialPost(req, res, next) {
  try {
    const { id } = req.params;

    const post = await prisma.socialPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Parse content if stored as JSON string
    const content = typeof post.content === 'string' ? JSON.parse(post.content) : post.content;

    // Use social media service to publish to actual platform
    const result = await socialMediaService.publishSocialPost({
      id: post.id,
      platform: post.platform,
      content,
      mediaUrl: post.mediaUrl,
      accessTokens: {
        meta: process.env.META_ACCESS_TOKEN,
        linkedin: process.env.LINKEDIN_ACCESS_TOKEN,
      },
    });

    logger.info('Social post published', { postId: id, platform: post.platform });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get social media analytics
 */
async function getSocialAnalytics(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { startDate, endDate } = req.query;

    const where = {
      accountId,
      status: 'published'
    };

    if (startDate) {
      where.publishedAt = {
        ...where.publishedAt,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      where.publishedAt = {
        ...where.publishedAt,
        lte: new Date(endDate)
      };
    }

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' }
    });

    // Calculate aggregate metrics
    const analytics = {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, p) => sum + p.likesCount, 0),
      totalComments: posts.reduce((sum, p) => sum + p.commentsCount, 0),
      totalShares: posts.reduce((sum, p) => sum + p.sharesCount, 0),
      totalReach: posts.reduce((sum, p) => sum + p.reachCount, 0),
      engagementRate: posts.length > 0
        ? (((posts.reduce((sum, p) => sum + p.likesCount + p.commentsCount + p.sharesCount, 0)) /
            (posts.reduce((sum, p) => sum + p.reachCount, 1))) * 100).toFixed(2)
        : '0',
      postsByPlatform: {}
    };

    // Group by platform
    posts.forEach(post => {
      if (!analytics.postsByPlatform[post.platform]) {
        analytics.postsByPlatform[post.platform] = { count: 0, likes: 0, engagement: 0 };
      }
      analytics.postsByPlatform[post.platform].count++;
      analytics.postsByPlatform[post.platform].likes += post.likesCount;
      analytics.postsByPlatform[post.platform].engagement += post.likesCount + post.commentsCount + post.sharesCount;
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// SEO AUDIT (System #7)
// ============================================

/**
 * Get SEO audit for a business
 */
async function getSEOAudit(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { businessId } = req.query;

    const audit = await prisma.sEOAudit.findFirst({
      where: {
        accountId,
        businessId: businessId || undefined
      },
      orderBy: { lastAuditedAt: 'desc' }
    });

    if (!audit) {
      return res.json({
        success: true,
        data: {
          seoHealthScore: 0,
          gmbCompletenessScore: 0,
          citationConsistencyScore: 0,
          localKeywordRankings: [],
          actionItems: [],
          message: 'No audit found. Run a new audit to get started.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...audit,
        localKeywordRankings: audit.localKeywordRankings ? JSON.parse(audit.localKeywordRankings) : [],
        actionItems: audit.actionItems ? JSON.parse(audit.actionItems) : []
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Run a new SEO audit
 */
async function runSEOAudit(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { businessId, businessName, industry, location } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId is required'
      });
    }

    // Use SEO audit service for comprehensive audit
    const result = await seoAuditService.runSEOAudit(
      { businessId, name: businessName, industry, location },
      accountId
    );

    res.json({
      success: true,
      data: result.audit,
      scores: result.scores
    });
  } catch (err) {
    next(err);
  }
}

// ============================================
// ADDITIONAL SOCIAL & SEO CONTROLLERS (System #7)
// ============================================

/**
 * Schedule a social post for later
 */
async function scheduleSocialPost(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { businessId, platform, content, mediaUrl, scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'scheduledAt is required for scheduling'
      });
    }

    const result = await socialMediaService.scheduleSocialPost({
      businessId,
      platform,
      content,
      mediaUrl,
      scheduledAt,
      accountId,
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get optimal send times for platforms
 */
async function getOptimalSendTimes(req, res, next) {
  try {
    const { platform, industry } = req.query;
    const times = socialMediaService.getOptimalSendTimes(platform || 'INSTAGRAM', industry);
    res.json({
      success: true,
      data: { platform: platform || 'INSTAGRAM', optimalTimes: times }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Repurpose a 5-star review to social post
 */
async function repurposerReviewToPost(req, res, next) {
  try {
    const { reviewId, businessData, autoApprove = false } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        error: 'reviewId is required'
      });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.rating < 5) {
      return res.status(400).json({ success: false, error: 'Only 5-star reviews can be repurposed' });
    }

    const result = await socialMediaService.repurposerReviewToPost(review, businessData);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get SEO audit history for a business
 */
async function getSEOAuditHistory(req, res, next) {
  try {
    const { businessId, limit = 10 } = req.query;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'businessId is required' });
    }

    const history = await seoAuditService.getAuditHistory(businessId, parseInt(limit));
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

/**
 * Get SEO recommendations based on current scores
 */
async function getSEORecommendations(req, res, next) {
  try {
    const { gmbScore, citationScore, industry } = req.query;
    const recommendations = seoAuditService.getSEORecommendations(
      parseInt(gmbScore) || 0,
      parseInt(citationScore) || 0,
      industry || 'default'
    );
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
}

/**
 * Get content pillars for an industry
 */
async function getContentPillars(req, res, next) {
  try {
    const { industry } = req.params;
    const pillars = socialMediaService.CONTENT_PILLARS[industry] || socialMediaService.CONTENT_PILLARS.default;
    res.json({ success: true, data: { industry, pillars } });
  } catch (err) {
    next(err);
  }
}

/**
 * Get citation health for a business
 */
async function getCitationHealth(req, res, next) {
  try {
    const accountId = req.account?.id || 'default';
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'businessId is required' });
    }

    const health = await seoAuditService.monitorCitationHealth(accountId, { businessId });
    res.json({ success: true, data: health });
  } catch (err) {
    next(err);
  }
}

/**
 * Get competitor insights for local SEO
 */
async function getCompetitorInsights(req, res, next) {
  try {
    const { location, industry } = req.query;
    const insights = await seoAuditService.getCompetitorInsights(location || 'Local Area', industry || 'default');
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Reviews
  getReviews,
  getReviewById,
  storeReview,
  generateAIResponse,
  approveResponse,
  dismissResponse,
  triggerReviewRequest,
  triggerWinBack,
  getReputationKPIs,
  getSentimentDistribution,
  // Social
  getSocialPosts,
  createSocialPost,
  generateSocialContent,
  publishSocialPost,
  scheduleSocialPost,
  getOptimalSendTimes,
  repurposerReviewToPost,
  getSocialAnalytics,
  // SEO
  getSEOAudit,
  runSEOAudit,
  getSEOAuditHistory,
  getSEORecommendations,
  getCitationHealth,
  getCompetitorInsights,
  // Content
  getContentPillars,
};