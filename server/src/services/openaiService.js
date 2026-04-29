const OpenAI = require('openai');

let openai;

try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'missing',
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

const generateOutreach = async (lead, tone, serviceFocus) => {
  const { 
    name, 
    industry, 
    website, 
    rating, 
    reviewCount, 
    hasUrgencyMarker, 
    hasEfficiencyMarker, 
    hasRecoveryMarker 
  } = lead;

  const systemPrompt = `You are an elite high-ticket sales closer for LeadForge AI, a premium Growth Operating System.
Your goal is to generate a personalized, psychologically compelling outreach message for a business owner.

Lead Data:
- Business: ${name}
- Industry: ${industry}
- Website: ${website || 'None'}
- Rating: ${rating || 'N/A'}
- Reviews: ${reviewCount || 'N/A'}
- Urgency Trigger: ${hasUrgencyMarker ? 'YES (High rating, low volume)' : 'NO'}
- Efficiency Trigger: ${hasEfficiencyMarker ? 'YES (Reservable but no web booking)' : 'NO'}
- Recovery Trigger: ${hasRecoveryMarker ? 'YES (Recent review score dip)' : 'NO'}

Tone Guidelines:
- luxury: High-level vocabulary, focus on prestige and reclaimed time.
- aggressive: Focus on beating competitors and "missing out" on revenue.
- friendly: Focus on community and taking the operational load off.
- formal: Focus on data, efficiency, and professional standards.

Service to Pitch: ${serviceFocus}

Strategic Hooks:
- If Efficiency: "I noticed you’re marked as 'Reservable' on Google, but no booking link on your site. We can automate this 24/7."
- If Urgency: "Your 4.5+ star rating is great, but volume is low compared to competitors. Our AI system handles review capture automatically."
- If Recovery: "I noticed a dip in recent reviews. Our 'Win-Back' AI repairs reputation before negatives go public."
- If No Website: "In ${industry}, 70% of clients won't book without a site. We can launch a high-conversion funnel in days."

Constraints:
- Response must be a JSON object with 'subject' and 'body'.
- NEVER be generic. Use the specific triggers provided.
- Keep it concise but powerful.
- No spammy sales talk. Be a strategic partner.`;

  const userPrompt = `Synthesize a ${tone} outreach message for ${name} focusing on ${serviceFocus}. Use the available markers to create a "Hook" that makes them stop scrolling.`;

  try {
    if (!openai || process.env.OPENAI_API_KEY === 'missing') {
       throw new Error('OpenAI key missing');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Logic Error:', error.message);
    throw error;
  }
};

/**
 * Analyze sentiment of text using OpenAI
 * @param {string} text - Text to analyze
 * @returns {Object} Sentiment analysis result
 */
async function analyzeSentiment(text) {
  const systemPrompt = `You are a sentiment analysis expert. Analyze the text and return a JSON object with:
- score: number from -100 (very negative) to +100 (very positive)
- label: one of VERY_NEGATIVE, NEGATIVE, NEUTRAL, POSITIVE, VERY_POSITIVE
- keywords: array of key emotional words found

Only respond with valid JSON.`;

  try {
    if (!openai || process.env.OPENAI_API_KEY === 'missing') {
      throw new Error('OpenAI key missing');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this review's sentiment:\n\n${text}` },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error('Sentiment analysis error:', error.message);
    throw error;
  }
}

/**
 * Generate social media content using AI
 * @param {string} prompt - Content generation prompt
 * @returns {string} Generated content
 */
async function generateContent(prompt) {
  try {
    if (!openai || process.env.OPENAI_API_KEY === 'missing') {
      throw new Error('OpenAI key missing');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a creative social media content writer. Create engaging, authentic content that feels human and professional.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error('Content generation error:', error.message);
    throw error;
  }
}

/**
 * Generate a JSON response from OpenAI
 * @param {string} systemPrompt - The system prompt
 * @param {string} userPrompt - The user prompt
 * @returns {Promise<Object>} The parsed JSON response
 */
async function generateJson(systemPrompt, userPrompt) {
  try {
    if (!openai || process.env.OPENAI_API_KEY === 'missing') {
      throw new Error('OpenAI key missing');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI JSON Generation Error:', error.message);
    throw error;
  }
}

/**
 * Generate website content using AI
 * @param {Object} lead - Lead data
 * @param {string} templateId - Template identifier
 * @returns {Object} Generated website content
 */
async function generateWebsiteContent(lead, templateId) {
  const { name, industry, city, country, rating, reviewCount } = lead;

  const systemPrompt = `You are an elite web designer and copywriter for LeadForge AI.
Your goal is to generate high-conversion, premium website content for a ${industry} business called "${name}" in ${city || 'their local area'}.

The content must follow the "Elite" structure:
1. Hero Section (Headline, Sub-headline, CTA text)
2. The "Gap" (Problem/Solution)
3. Service/Offer Showcase (3-4 items)
4. AI Efficiency Section (How 24/7 AI booking helps)
5. FAQ Section (3-4 common questions)
6. WhatsApp Config (Pre-filled message)

Constraints:
- Response must be a JSON object matching this structure:
{
  "theme": {
    "primaryColor": "#...", // Suggest a premium color based on industry
    "accentColor": "#..."
  },
  "hero": {
    "headline": "...",
    "subheadline": "...",
    "ctaText": "Book via WhatsApp"
  },
  "gap": {
    "problem": "...",
    "solution": "..."
  },
  "services": [
    { "title": "...", "description": "...", "price": "..." }
  ],
  "efficiency": {
    "title": "24/7 AI-Powered Booking",
    "description": "..."
  },
  "faq": [
    { "question": "...", "answer": "..." }
  ],
  "whatsapp": {
    "prefilledMessage": "Hi! I'd like to book/inquire about..."
  }
}

Industry: ${industry}
Business Name: ${name}
Location: ${city}, ${country}
Rating: ${rating} (${reviewCount} reviews)

Ensure the copy is persuasive, luxury-feeling, and focused on conversions.`;

  try {
    if (!openai || process.env.OPENAI_API_KEY === 'missing') {
       throw new Error('OpenAI key missing');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the website content for ${name}.` },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Website Generation Error:', error.message);
    throw error;
  }
}

/**
 * Classify intent of text using OpenAI
 * @param {string} text - Text to classify
 * @param {Array<string>} categories - Available intent categories
 * @returns {string} The detected category
 */
async function classifyIntent(text, categories) {
  const systemPrompt = `You are an intent classification expert.
Analyze the provided text and classify it into one of the following categories:
${categories.join(', ')}

Return ONLY the name of the category that best matches the intent. If no category matches well, return the first one as default.`;

  try {
    if (!openai || process.env.OPENAI_API_KEY === 'missing') {
      throw new Error('OpenAI key missing');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Classify this text:\n\n${text}` },
      ],
      max_tokens: 10,
    });

    const category = response.choices[0].message.content.trim();
    // Validate that it's one of the categories (strip punctuation if any)
    const matched = categories.find(c => category.toLowerCase().includes(c.toLowerCase()));
    return matched || categories[0];
  } catch (error) {
    console.error('Intent classification error:', error.message);
    throw error;
  }
}

module.exports = {
  generateOutreach,
  analyzeSentiment,
  generateContent,
  generateJson,
  generateWebsiteContent,
  classifyIntent,
};
