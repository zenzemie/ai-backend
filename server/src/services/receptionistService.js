const prisma = require('../config/prisma');
const openaiService = require('./openaiService');
const logger = require('./logger');
const { emitMissedCallDetected, emitAppointmentBookedVoice } = require('./automation/triggerService');

/**
 * Get receptionist configuration by ID
 * @param {string} id - Receptionist ID
 * @returns {Promise<Object>} Receptionist with account
 */
const getReceptionistById = async (id) => {
  try {
    return await prisma.aIReceptionist.findUnique({
      where: { id },
      include: { account: true }
    });
  } catch (error) {
    logger.error(`Error fetching receptionist ${id}:`, error);
    throw error;
  }
};

/**
 * Get receptionist by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} Receptionist
 */
const getReceptionistByPhone = async (phoneNumber) => {
  try {
    return await prisma.aIReceptionist.findUnique({
      where: { phoneNumber }
    });
  } catch (error) {
    logger.error(`Error fetching receptionist by phone ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Create a new call log entry
 * @param {Object} data - Call log data
 * @returns {Promise<Object>} Created call log
 */
const createCallLog = async (data) => {
  try {
    return await prisma.callLog.create({
      data
    });
  } catch (error) {
    logger.error('Error creating call log:', error);
    throw error;
  }
};

/**
 * Update an existing call log entry
 * @param {string} id - Call log ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated call log
 */
const updateCallLog = async (id, data) => {
  try {
    return await prisma.callLog.update({
      where: { id },
      data
    });
  } catch (error) {
    logger.error(`Error updating call log ${id}:`, error);
    throw error;
  }
};

/**
 * Process end of call report
 * @param {Object} vapiCallData - Data from Vapi end-of-call-report
 */
const processEndOfCall = async (vapiCallData) => {
  const { id: callId, customer, transcript, recordingUrl, summary, assistantId, duration } = vapiCallData;
  const fromNumber = customer?.number || 'Unknown';

  try {
    // Find receptionist associated with this assistantId (stored in metadata or config)
    // For now, let's assume assistantId is the receptionistId or we look it up
    let receptionist = await prisma.aIReceptionist.findFirst({
      where: { 
        OR: [
          { id: assistantId },
          { voiceConfig: { path: ['assistantId'], equals: assistantId } }
        ]
      }
    });

    if (!receptionist) {
      logger.warn(`No receptionist found for assistantId: ${assistantId}`);
      // Fallback or handle error
      return;
    }

    // Analyze call outcome and sentiment using OpenAI
    const analysis = await analyzeCallOutcome(transcript);

    // Create/Update call log
    const callLog = await createCallLog({
      receptionistId: receptionist.id,
      fromNumber,
      transcript,
      summary: summary || analysis.summary,
      recordingUrl,
      duration: Math.round(duration || 0),
      status: 'COMPLETED',
      outcome: analysis.outcome,
      bookingType: analysis.bookingType,
      escalationReason: analysis.escalationReason,
      sentimentScore: analysis.sentimentScore
    });

    // Emit triggers for automation engine
    if (analysis.outcome === 'BOOKED') {
      emitAppointmentBookedVoice(receptionist.id, {
        callLogId: callLog.id,
        fromNumber,
        bookingType: analysis.bookingType,
        summary: analysis.summary
      }).catch(err => logger.error('Failed to emit appointment trigger', { error: err.message }));
    }
    
    // In a real scenario, missed calls would be detected by Vapi status 'failed' or 'no-answer'
    // but we can also trigger it if the outcome was 'ABANDONED' or specific logic
    if (analysis.outcome === 'ABANDONED' && duration < 10) {
      emitMissedCallDetected(callLog).catch(err => 
        logger.error('Failed to emit missed call trigger', { error: err.message })
      );
    }

    logger.info(`Processed call log for call ${callId}`);
  } catch (error) {
    logger.error('Error processing end of call:', error);
  }
};

/**
 * Analyze call transcript for outcome and sentiment
 * @param {string} transcript - Call transcript
 * @returns {Promise<Object>} Analysis result
 */
const analyzeCallOutcome = async (transcript) => {
  const systemPrompt = `You are an expert call analyst for LeadForge AI. 
Analyze the following call transcript between an AI Receptionist and a customer.
Determine the outcome, sentiment, and other key details.

Outcome must be one of: BOOKED, INFORMATIONAL, ESCALATED, ABANDONED.
- BOOKED: If the customer successfully scheduled an appointment or service.
- ESCALATED: If the customer asked to speak to a human or the AI transferred the call.
- INFORMATIONAL: If the customer just asked questions and got answers without booking or escalating.
- ABANDONED: If the customer hung up before completing their intent.

Sentiment Score: -1.0 (very negative/angry) to 1.0 (very positive/happy).

Return a JSON object with:
{
  "outcome": "BOOKED" | "INFORMATIONAL" | "ESCALATED" | "ABANDONED",
  "bookingType": "string or null",
  "escalationReason": "string or null",
  "sentimentScore": number,
  "summary": "Short 1-2 sentence summary of the call"
}`;

  try {
    const analysis = await openaiService.generateJson(systemPrompt, `Transcript:\n${transcript}`);
    return analysis;
  } catch (error) {
    logger.error('Error analyzing call outcome:', error);
    return {
      outcome: 'INFORMATIONAL',
      bookingType: null,
      escalationReason: null,
      sentimentScore: 0,
      summary: 'Analysis failed.'
    };
  }
};

/**
 * Get industry specific configuration
 * @param {string} industry - Industry name
 * @returns {Object} Configuration including system prompt and voice settings
 */
const getIndustryConfig = (industry) => {
  // This could be moved to a database or a separate config file
  // For now, I'll hardcode some values based on the specs
  const configs = {
    'Restaurant': {
      voiceId: 'eleven_voice_id_restaurant', // Placeholder
      greeting: "Good evening! You've reached our restaurant — this is your virtual host. How can I make your evening special tonight?",
      personality: "Warm, slightly energetic, genuine hospitality",
      // ... more
    },
    'Clinic': {
      voiceId: 'eleven_voice_id_clinic', // Placeholder
      greeting: "Good morning, you've reached our clinic. Thank you for calling. How can I help you today?",
      personality: "Calm, professional, reassuring",
    },
    // ... other industries
  };

  return configs[industry] || configs['Restaurant']; // Default
};

module.exports = {
  getReceptionistById,
  getReceptionistByPhone,
  createCallLog,
  updateCallLog,
  processEndOfCall,
  analyzeCallOutcome,
  getIndustryConfig
};
