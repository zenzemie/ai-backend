const prisma = require('../config/prisma');
const openaiService = require('./openaiService');

class WebsiteService {
  async createWebsite(data) {
    return await prisma.website.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
    });
  }

  async getWebsites(accountId) {
    return await prisma.website.findMany({
      where: { accountId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getWebsiteById(id) {
    return await prisma.website.findUnique({
      where: { id },
    });
  }

  async getWebsiteBySlug(slug) {
    return await prisma.website.findUnique({
      where: { slug },
      include: {
        account: true
      }
    });
  }

  async updateWebsite(id, data) {
    return await prisma.website.update({
      where: { id },
      data,
    });
  }

  async deleteWebsite(id) {
    return await prisma.website.delete({
      where: { id },
    });
  }

  async generateWebsite(accountId, leadId, templateId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const content = await openaiService.generateWebsiteContent(lead, templateId);
    
    // Create slug from lead name
    const slug = lead.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);

    return await this.createWebsite({
      title: `${lead.name} Landing Page`,
      slug,
      templateId,
      content,
      accountId,
    });
  }
}

module.exports = new WebsiteService();
