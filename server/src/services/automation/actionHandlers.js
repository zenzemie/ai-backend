/**
 * Automation Action Handlers
 * Each handler corresponds to an action defined in AUTOMATION_ENGINE_SPECS.md
 * Implements idempotent action execution with proper error handling
 */
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
const prisma = require('../../config/prisma');

/**
 * Action: Send WhatsApp Pitch
 * Sends a personalized WhatsApp message via the WhatsApp Business API
 */
async function sendWhatsAppPitch(actionData, automationId) {
  const { leadId, message, phoneNumber } = actionData;
  
  // Idempotency check - prevent duplicate sends
  const existingLog = await prisma.outreachLog.findFirst({
    where: {
      leadId,
      channel: 'WHATSAPP',
      body: message,
      sentAt: { not: null },
    },
  });
  
  if (existingLog) {
    logger.info('WhatsApp pitch already sent, skipping (idempotency)', { leadId });
    return { skipped: true, reason: 'already_sent', existingLogId: existingLog.id };
  }
  
  // Placeholder for WhatsApp API integration
  // In production, this would call the WhatsApp Business API
  logger.info('Sending WhatsApp pitch', { leadId, phoneNumber, automationId });
  
  // Simulated send - replace with actual WhatsApp API call
  const sent = await simulateWhatsAppSend(phoneNumber, message);
  
  if (sent) {
    // Log the outreach
    await prisma.outreachLog.create({
      data: {
        leadId,
        channel: 'WHATSAPP',
        status: 'SENT',
        body: message,
        sentAt: new Date(),
      },
    });
    
    return { success: true, sentAt: new Date().toISOString() };
  }
  
  throw new Error('WhatsApp send failed');
}

/**
 * Action: Send Email Follow-up
 * Sends a scheduled follow-up email via Resend
 */
async function sendEmailFollowup(actionData, automationId) {
  const { leadId, subject, body, emailAddress } = actionData;
  
  // Idempotency check
  const existingLog = await prisma.outreachLog.findFirst({
    where: {
      leadId,
      channel: 'EMAIL',
      subject,
      body,
      sentAt: { not: null },
    },
  });
  
  if (existingLog) {
    logger.info('Email followup already sent, skipping (idempotency)', { leadId });
    return { skipped: true, reason: 'already_sent', existingLogId: existingLog.id };
  }
  
  // Get Resend service
  const resendService = require('../resendService');
  
  logger.info('Sending email followup', { leadId, emailAddress, subject, automationId });
  
  try {
    const result = await resendService.sendEmail({
      to: emailAddress,
      subject,
      body,
    });
    
    // Log the outreach
    await prisma.outreachLog.create({
      data: {
        leadId,
        channel: 'EMAIL',
        status: 'SENT',
        subject,
        body,
        sentAt: new Date(),
      },
    });
    
    return { success: true, messageId: result.id, sentAt: new Date().toISOString() };
  } catch (err) {
    logger.error('Email followup failed', { error: err.message, leadId });
    throw err;
  }
}

/**
 * Action: Update Lead Status
 * Changes a lead's status in the CRM pipeline
 */
async function updateLeadStatus(actionData, automationId) {
  const { leadId, newStatus, notes } = actionData;
  
  // Validate status
  const validStatuses = ['NOT_CONTACTED', 'DISCOVERED', 'QUALIFIED', 'SENT', 'OPENED', 'REPLIED', 'INTERESTED', 'MEETING_BOOKED', 'CONVERTED', 'REJECTED'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: newStatus,
      updatedAt: new Date(),
      ...(notes && { notes }),
    },
  });
  
  logger.info('Lead status updated', { leadId, newStatus, automationId });
  
  return { success: true, lead };
}

/**
 * Action: Alert Owner via WhatsApp
 * Notifies the business owner of high-value events
 */
async function alertOwnerWhatsApp(actionData, automationId) {
  const { ownerPhone, alertMessage, eventType, priority } = actionData;
  
  // This could be used for urgent notifications like:
  // - Negative review received
  // - High-value lead converted
  // - Appointment booked
  
  logger.info('Owner alert via WhatsApp', {
    eventType,
    priority,
    automationId,
  });
  
  // In production, send actual WhatsApp message to owner
  // For now, just log it
  return {
    success: true,
    alertSent: true,
    eventType,
    priority,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Action: Request Review via SMS
 * Sends an SMS with a review link after a trigger event
 */
async function requestReviewSMS(actionData, automationId) {
  const { leadId, phoneNumber, reviewLink, platform } = actionData;
  
  // Idempotency check
  const existingLog = await prisma.outreachLog.findFirst({
    where: {
      leadId,
      channel: 'SMS',
      body: `Review request: ${reviewLink}`,
      sentAt: { not: null },
    },
  });
  
  if (existingLog) {
    logger.info('Review request already sent, skipping (idempotency)', { leadId });
    return { skipped: true, reason: 'already_sent' };
  }
  
  logger.info('Sending review request SMS', { leadId, phoneNumber, platform, automationId });
  
  // Placeholder for Twilio SMS integration
  const sent = await simulateSMSSend(phoneNumber, `We'd love your feedback! ${reviewLink}`);
  
  if (sent) {
    await prisma.outreachLog.create({
      data: {
        leadId,
        channel: 'SMS',
        status: 'SENT',
        body: `Review request: ${reviewLink}`,
        sentAt: new Date(),
      },
    });
    
    return { success: true, sentAt: new Date().toISOString() };
  }
  
  throw new Error('SMS send failed');
}

/**
 * Action: Generate Social Post
 * Uses AI to turn a milestone into a social media draft
 */
async function generateSocialPost(actionData, automationId) {
  const { milestone, platform, tone, businessContext } = actionData;
  
  const openaiService = require('../openaiService');
  
  const prompt = `Generate a social media post celebrating this business milestone:
Milestone: ${milestone}
Platform: ${platform}
Tone: ${tone || 'excited'}
Business Context: ${businessContext || 'A growing business using AI automation'}

Create an engaging, authentic post that feels human. Include relevant hashtags.`;
  
  try {
    const content = await openaiService.generateContent(prompt);
    
    logger.info('Social post generated', { milestone, platform, automationId });
    
    return {
      success: true,
      content,
      platform,
      milestone,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('Social post generation failed', { error: err.message });
    throw err;
  }
}

/**
 * Action: Trigger External Webhook
 * Pushes data to a 3rd party URL (Stripe, Shopify, custom apps)
 */
async function triggerExternalWebhook(actionData, automationId) {
  const { webhookUrl, method, headers, body, secretKey } = actionData;
  
  logger.info('Triggering external webhook', { webhookUrl, method, automationId });
  
  try {
    const response = await fetch(webhookUrl, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secretKey && { 'Authorization': `Bearer ${secretKey}` }),
        ...headers,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    logger.info('External webhook triggered successfully', {
      webhookUrl,
      status: response.status,
      automationId,
    });
    
    return {
      success: true,
      statusCode: response.status,
      response: responseData,
      triggeredAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('External webhook failed', { error: err.message, webhookUrl });
    throw err;
  }
}

/**
 * Action: Schedule Follow-up
 * Schedules a follow-up action for a future time
 */
async function scheduleFollowup(actionData, automationId) {
  const { leadId, followUpType, delayMs, additionalData } = actionData;
  
  // This creates a delayed job in the queue
  const queueService = require('./queueService');
  
  const followUpJob = {
    leadId,
    automationId,
    followUpType,
    ...additionalData,
  };
  
  await queueService.queueAction(followUpType, followUpJob, {
    delay: delayMs, // Delay in milliseconds
  });
  
  logger.info('Follow-up scheduled', {
    leadId,
    followUpType,
    delayMs,
    automationId,
    scheduledFor: new Date(Date.now() + delayMs).toISOString(),
  });
  
  return {
    success: true,
    followUpType,
    scheduledFor: new Date(Date.now() + delayMs).toISOString(),
  };
}

// Simulated WhatsApp send (placeholder for actual WhatsApp Business API)
async function simulateWhatsAppSend(phoneNumber, message) {
  // In production, integrate with WhatsApp Business API
  logger.info('WhatsApp message would be sent', { phoneNumber, messageLength: message.length });
  return true;
}

// Simulated SMS send (placeholder for actual Twilio integration)
async function simulateSMSSend(phoneNumber, message) {
  // In production, integrate with Twilio API
  logger.info('SMS message would be sent', { phoneNumber, messageLength: message.length });
  return true;
}

// Export all action handlers
module.exports = {
  send_whatsapp_pitch: sendWhatsAppPitch,
  send_email_followup: sendEmailFollowup,
  update_lead_status: updateLeadStatus,
  alert_owner_whatsapp: alertOwnerWhatsApp,
  request_review_sms: requestReviewSMS,
  generate_social_post: generateSocialPost,
  trigger_external_webhook: triggerExternalWebhook,
  schedule_followup: scheduleFollowup,
};
