const receptionistService = require('../services/receptionistService');
const prisma = require('../config/prisma');
const logger = require('../services/logger');

/**
 * Handle Vapi webhooks
 */
exports.handleVapiWebhook = async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Missing message in request body' });
  }

  const type = message.type;
  logger.info(`Received Vapi webhook: ${type}`);

  try {
    switch (type) {
      case 'assistant-request':
        // Vapi asking for assistant configuration
        await handleAssistantRequest(message, res);
        break;

      case 'end-of-call-report':
        // Call ended, process the report
        await handleEndOfCallReport(message);
        res.status(200).json({ success: true });
        break;

      case 'speech-update':
        // Periodic updates during speech
        res.status(200).json({ success: true });
        break;

      case 'status-update':
        // Updates on call status
        res.status(200).json({ success: true });
        break;

      default:
        logger.info(`Unhandled Vapi webhook type: ${type}`);
        res.status(200).json({ success: true });
    }
  } catch (error) {
    logger.error('Vapi Webhook Processing Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Handle assistant request from Vapi
 * This is where we provide the prompt and voice settings for the call
 */
async function handleAssistantRequest(message, res) {
  const { assistantId, customer, phoneNumber } = message;
  const toPhoneNumber = phoneNumber?.number;

  try {
    // Find receptionist by phone number or ID
    let receptionist = await receptionistService.getReceptionistByPhone(toPhoneNumber);
    
    if (!receptionist && assistantId) {
      receptionist = await receptionistService.getReceptionistById(assistantId);
    }

    if (!receptionist) {
      logger.warn(`No receptionist found for phone ${toPhoneNumber} or id ${assistantId}`);
      // Return a default assistant or error
      return res.status(404).json({ error: 'Assistant not found' });
    }

    // Prepare Vapi assistant config
    // In a real scenario, we'd use the stored voiceConfig and industry prompts
    const config = receptionist.voiceConfig || {};
    
    const response = {
      assistant: {
        name: receptionist.name,
        model: {
          provider: "openai",
          model: "gpt-4o",
          systemPrompt: receptionist.knowledgeBase || "You are a helpful receptionist."
        },
        voice: {
          provider: "elevenlabs",
          voiceId: config.voiceId || "eleven_voice_id",
          settings: {
            stability: 0.40,
            clarity: 0.70,
            style: 0.20,
            speakerBoost: true
          }
        },
        firstMessage: config.firstMessage || `Hello, thank you for calling ${receptionist.name}. How can I help you?`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en"
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error handling assistant request:', error);
    res.status(500).json({ error: 'Failed to fetch assistant config' });
  }
}

/**
 * Handle end of call report from Vapi
 */
async function handleEndOfCallReport(message) {
  const { call, transcript, recordingUrl, summary, assistantId, duration } = message;
  
  await receptionistService.processEndOfCall({
    id: call?.id,
    customer: call?.customer,
    transcript,
    recordingUrl,
    summary,
    assistantId,
    duration
  });
}

/**
 * Get all call logs for a specific receptionist
 */
exports.getCallLogs = async (req, res) => {
  const { receptionistId } = req.params;
  const { accountId } = req.user; // Assuming auth middleware provides this

  try {
    const logs = await prisma.callLog.findMany({
      where: {
        receptionist: {
          id: receptionistId,
          accountId: accountId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(logs);
  } catch (error) {
    logger.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
};

/**
 * Get a single call log with transcript
 */
exports.getCallLogDetail = async (req, res) => {
  const { id } = req.params;
  const { accountId } = req.user;

  try {
    const log = await prisma.callLog.findFirst({
      where: {
        id,
        receptionist: {
          accountId
        }
      }
    });

    if (!log) {
      return res.status(404).json({ error: 'Call log not found' });
    }

    res.status(200).json(log);
  } catch (error) {
    logger.error('Error fetching call log detail:', error);
    res.status(500).json({ error: 'Failed to fetch call log detail' });
  }
};

/**
 * Create or update a receptionist configuration
 */
exports.upsertReceptionist = async (req, res) => {
  const { id, name, phoneNumber, voiceConfig, knowledgeBase, isActive } = req.body;
  const { accountId } = req.user;

  try {
    const data = {
      name,
      phoneNumber,
      voiceConfig,
      knowledgeBase,
      isActive,
      accountId
    };

    let receptionist;
    if (id) {
      receptionist = await prisma.aIReceptionist.update({
        where: { id },
        data
      });
    } else {
      receptionist = await prisma.aIReceptionist.create({
        data
      });
    }

    res.status(200).json(receptionist);
  } catch (error) {
    logger.error('Error upserting receptionist:', error);
    res.status(500).json({ error: 'Failed to save receptionist configuration' });
  }
};
