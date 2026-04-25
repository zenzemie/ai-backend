class AIService {
  generateMessage(name, industry, customTemplate) {
    if (customTemplate) {
      return customTemplate
        .replace(/\{\{name\}\}/g, name || 'there')
        .replace(/\{\{industry\}\}/g, industry || 'your industry');
    }

    return `Hey ${name || 'there'}, I saw you're in the ${industry || 'your industry'} space. I built a tool that helps businesses reply instantly to customers and capture more leads. Want to see it?`;
  }

  generatePersonalizedMessage(lead, campaign) {
    const template = campaign.messageTemplate;
    return this.generateMessage(lead.name, campaign.industry, template);
  }
}

module.exports = new AIService();
