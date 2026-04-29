/**
 * Sentiment Analysis Service
 * Analyzes review sentiment using OpenAI GPT-4o
 * Used to classify reviews as positive, neutral, or negative
 */
const logger = require('./logger');
const { analyzeSentiment } = require('./openaiService');

/**
 * Sentiment scores
 */
const SENTIMENT = {
  VERY_NEGATIVE: -100,
  NEGATIVE: -50,
  NEUTRAL: 0,
  POSITIVE: 50,
  VERY_POSATIVE: 100
};

/**
 * Rating thresholds for sentiment classification
 */
const RATING_THRESHOLDS = {
  NEGATIVE: 3,  // <= 3 stars is considered negative
  NEUTRAL: 4,   // 4 stars is neutral
  POSITIVE: 5   // 5 stars is positive
};

/**
 * Classify sentiment based on rating and text analysis
 * @param {number} rating - Star rating (1-5)
 * @param {string} text - Review text (optional for AI analysis)
 * @returns {Object} Sentiment analysis result
 */
async function classifySentiment(rating, text = null) {
  // Base sentiment from rating
  let baseScore;
  if (rating <= RATING_THRESHOLDS.NEGATIVE) {
    baseScore = SENTIMENT.NEGATIVE + (rating - 1) * 20; // -100 to -40
  } else if (rating === RATING_THRESHOLDS.NEUTRAL) {
    baseScore = SENTIMENT.NEUTRAL; // 0
  } else {
    baseScore = SENTIMENT.POSITIVE + (rating - 5) * 20; // 50 to 100
  }

  // If text provided, use AI for deeper analysis
  let finalScore = baseScore;
  let label = ratingToLabel(rating);

  if (text && text.length > 10) {
    try {
      const aiResult = await analyzeSentiment(text);
      // Blend AI score (70%) with base score (30%)
      finalScore = Math.round(aiResult.score * 0.7 + baseScore * 0.3);
      label = scoreToLabel(finalScore);
      
      logger.info('AI sentiment analysis completed', {
        rating,
        baseScore,
        aiScore: aiResult.score,
        finalScore
      });
    } catch (err) {
      logger.warn('AI sentiment analysis failed, using rating-based classification', {
        error: err.message
      });
    }
  }

  return {
    score: finalScore,
    label, // VERY_NEGATIVE, NEGATIVE, NEUTRAL, POSITIVE, VERY_POSITIVE
    isNegative: finalScore < 0,
    isPositive: finalScore > 0,
    rating
  };
}

/**
 * Convert rating number to label
 */
function ratingToLabel(rating) {
  if (rating <= 2) return 'VERY_NEGATIVE';
  if (rating === 3) return 'NEGATIVE';
  if (rating === 4) return 'NEUTRAL';
  return 'VERY_POSITIVE';
}

/**
 * Convert score to label
 */
function scoreToLabel(score) {
  if (score < -75) return 'VERY_NEGATIVE';
  if (score < -25) return 'NEGATIVE';
  if (score < 25) return 'NEUTRAL';
  if (score < 75) return 'POSITIVE';
  return 'VERY_POSITIVE';
}

/**
 * Batch analyze multiple reviews
 * @param {Array} reviews - Array of {id, rating, text}
 * @returns {Array} Array of sentiment results
 */
async function batchAnalyze(reviews) {
  const results = await Promise.all(
    reviews.map(async (review) => {
      try {
        const sentiment = await classifySentiment(review.rating, review.text);
        return { id: review.id, ...sentiment };
      } catch (err) {
        logger.error('Batch sentiment analysis failed for review', { reviewId: review.id });
        return {
          id: review.id,
          score: 0,
          label: 'NEUTRAL',
          isNegative: false,
          isPositive: false,
          rating: review.rating,
          error: err.message
        };
      }
    })
  );

  return results;
}

/**
 * Calculate aggregate sentiment from multiple reviews
 * @param {Array} sentimentResults - Array of sentiment analysis results
 * @returns {Object} Aggregate metrics
 */
function calculateAggregateSentiment(sentimentResults) {
  if (!sentimentResults || sentimentResults.length === 0) {
    return { averageScore: 0, totalReviews: 0, distribution: {} };
  }

  const totalScore = sentimentResults.reduce((sum, r) => sum + r.score, 0);
  const averageScore = Math.round(totalScore / sentimentResults.length);

  const distribution = {
    VERY_NEGATIVE: sentimentResults.filter(r => r.label === 'VERY_NEGATIVE').length,
    NEGATIVE: sentimentResults.filter(r => r.label === 'NEGATIVE').length,
    NEUTRAL: sentimentResults.filter(r => r.label === 'NEUTRAL').length,
    POSITIVE: sentimentResults.filter(r => r.label === 'POSITIVE').length,
    VERY_POSITIVE: sentimentResults.filter(r => r.label === 'VERY_POSITIVE').length
  };

  return {
    averageScore,
    label: scoreToLabel(averageScore),
    totalReviews: sentimentResults.length,
    distribution,
    negativeRate: ((distribution.VERY_NEGATIVE + distribution.NEGATIVE) / sentimentResults.length * 100).toFixed(1)
  };
}

module.exports = {
  classifySentiment,
  batchAnalyze,
  calculateAggregateSentiment,
  SENTIMENT,
  RATING_THRESHOLDS
};