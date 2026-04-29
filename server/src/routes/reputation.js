/**
 * Reputation & Social Media Routes
 * API endpoints for System #6 (AI Reputation & Review Manager) and System #7 (AI Social Media & SEO)
 */
const express = require('express');
const reputationController = require('../controllers/reputationController');

const router = express.Router();

// ============================================
// REVIEWS (System #6)
// ============================================

// Get all reviews
router.get('/reviews', reputationController.getReviews);

// Get single review
router.get('/reviews/:id', reputationController.getReviewById);

// Store new review (from webhook or polling)
router.post('/reviews', reputationController.storeReview);

// Generate AI response draft
router.post('/reviews/:id/generate-response', reputationController.generateAIResponse);

// Approve and post AI response
router.post('/reviews/:id/approve-response', reputationController.approveResponse);

// Dismiss response
router.post('/reviews/:id/dismiss', reputationController.dismissResponse);

// Trigger review request flow
router.post('/review-request', reputationController.triggerReviewRequest);

// Trigger win-back sequence for negative review
router.post('/reviews/:reviewId/win-back', reputationController.triggerWinBack);

// Get reputation KPIs
router.get('/kpis', reputationController.getReputationKPIs);

// Get sentiment distribution
router.get('/sentiment-distribution', reputationController.getSentimentDistribution);

// ============================================
// SOCIAL MEDIA (System #7)
// ============================================

// Get social posts
router.get('/social/posts', reputationController.getSocialPosts);

// Create social post draft
router.post('/social/posts', reputationController.createSocialPost);

// Generate AI content
router.post('/social/generate', reputationController.generateSocialContent);

// Publish social post
router.post('/social/posts/:id/publish', reputationController.publishSocialPost);

// Schedule social post
router.post('/social/schedule', reputationController.scheduleSocialPost);

// Get social analytics
router.get('/social/analytics', reputationController.getSocialAnalytics);

// Get optimal send times
router.get('/social/optimal-times', reputationController.getOptimalSendTimes);

// Repurpose a 5-star review to social post
router.post('/social/repurpose-review', reputationController.repurposerReviewToPost);

// ============================================
// SEO (System #7)
// ============================================

// Get SEO audit
router.get('/seo/audit', reputationController.getSEOAudit);

// Run new SEO audit
router.post('/seo/audit', reputationController.runSEOAudit);

// Get SEO audit history
router.get('/seo/audit-history', reputationController.getSEOAuditHistory);

// Get SEO recommendations
router.get('/seo/recommendations', reputationController.getSEORecommendations);

// ============================================
// CONTENT PILLARS & UTILITIES (System #7)
// ============================================

// Get content pillars for an industry
router.get('/content/pillars/:industry', reputationController.getContentPillars);

// Get citation health
router.get('/seo/citation-health', reputationController.getCitationHealth);

// Get competitor insights
router.get('/seo/competitor-insights', reputationController.getCompetitorInsights);

module.exports = router;