const prisma = require('../config/prisma');
const { generateOutreach } = require('../services/openaiService');
const { sendEmail } = require('../services/resendService');

const generatePitch = async (req, res) => {
  const { leadId, tone, serviceFocus } = req.body;

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    let message;
    try {
      message = await generateOutreach(lead, tone, serviceFocus);
    } catch (aiError) {
      console.warn('AI Generation failed, using pro template fallback');
      message = {
        subject: `Strategic growth for ${lead.name}`,
        body: `Hi ${lead.name} team,\n\nI noticed some significant automation opportunities for your ${lead.industry} business. We specialize in AI-powered revenue engines that could help you recover roughly 15 hours of staff time per week.\n\nWould you be open to a 5-minute demo?\n\nBest,\nLeadForge AI`
      };
    }

    // Operation Black Forge: Save the generated pitch to OutreachLog as PENDING
    await prisma.outreachLog.create({
      data: {
        leadId,
        channel: 'EMAIL', // Defaulting to EMAIL for now
        status: 'PENDING',
        subject: message.subject,
        body: message.body
      }
    });

    res.status(200).json(message);
  } catch (error) {
    console.error('Outreach Generation Error:', error);
    res.status(500).json({ error: 'System processing error' });
  }
};

const sendEmailOutreach = async (req, res) => {
  const { leadId, subject, body } = req.body;

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead || !lead.email) {
      return res.status(400).json({ error: 'Lead has no email address listed.' });
    }

    await sendEmail(lead.email, subject, body.replace(/\n/g, '<br>'));
    
    // Log outreach
    await prisma.outreachLog.create({
      data: {
        leadId,
        channel: 'EMAIL',
        status: 'SENT',
        subject,
        body,
        sentAt: new Date()
      }
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'SENT' }
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
};

module.exports = {
  generatePitch,
  sendEmailOutreach,
};
