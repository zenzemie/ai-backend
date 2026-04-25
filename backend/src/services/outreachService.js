const prisma = require('../lib/prisma');
const aiService = require('./aiService');

class OutreachService {
  async sendOutreach(leadId, campaignId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { campaign: true },
    });

    if (!lead || !lead.campaign) {
      throw new Error('Lead or campaign not found');
    }

    if (lead.status === 'SENT' || lead.status === 'BOUNCED') {
      return { status: lead.status, message: 'Already processed' };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'PROCESSING' },
    });

    try {
      const message = aiService.generatePersonalizedMessage(lead, lead.campaign);
      
      await this.simulateEmailSend(lead.email, message);

      await prisma.$transaction([
        prisma.lead.update({
          where: { id: leadId },
          data: { status: 'SENT' },
        }),
        prisma.outreachLog.create({
          data: {
            leadId,
            status: 'SENT',
            message,
          },
        }),
      ]);

      return { status: 'SENT', message };
    } catch (error) {
      await prisma.$transaction([
        prisma.lead.update({
          where: { id: leadId },
          data: { status: 'FAILED' },
        }),
        prisma.outreachLog.create({
          data: {
            leadId,
            status: 'FAILED',
            error: error.message,
          },
        }),
      ]);

      throw error;
    }
  }

  async simulateEmailSend(email, message) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { email, message, sentAt: new Date() };
  }

  async getCampaignStats(campaignId) {
    const [total, pending, processing, sent, failed, bounced] = await Promise.all([
      prisma.lead.count({ where: { campaignId } }),
      prisma.lead.count({ where: { campaignId, status: 'PENDING' } }),
      prisma.lead.count({ where: { campaignId, status: 'PROCESSING' } }),
      prisma.lead.count({ where: { campaignId, status: 'SENT' } }),
      prisma.lead.count({ where: { campaignId, status: 'FAILED' } }),
      prisma.lead.count({ where: { campaignId, status: 'BOUNCED' } }),
    ]);

    return {
      total,
      pending,
      processing,
      sent,
      failed,
      bounced,
      completionRate: total > 0 ? ((sent + failed + bounced) / total) * 100 : 0,
    };
  }
}

module.exports = new OutreachService();
