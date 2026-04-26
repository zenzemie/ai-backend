const { Resend } = require('resend');
const logger = require('./logger');

let resend;

try {
  resend = new Resend(process.env.RESEND_API_KEY || 'missing');
} catch (error) {
  console.error('Failed to initialize Resend client:', error.message);
  resend = {
    emails: {
      send: () => { throw new Error('Resend client not initialized'); }
    }
  };
}

const sendEmail = async (to, subject, html, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'LeadForge <onboarding@resend.dev>', // Use verified domain in production
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info(`Email sent successfully to ${to}`, { messageId: data.id });
      return data;
    } catch (error) {
      logger.error(`Attempt ${i + 1} failed sending email to ${to}: ${error.message}`);
      if (i === retries - 1) throw new Error(`Failed after ${retries} attempts: ${error.message}`);
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

module.exports = {
  sendEmail,
};
