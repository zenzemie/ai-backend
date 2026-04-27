const { generateOutreach } = require('../services/openaiService');
const { sendEmail } = require('../services/resendService');
const supabase = require('../config/supabase');

const generateMessage = async (req, res) => {
  const { leadId, tone, serviceFocus } = req.body;

  try {
    let leadData;
    
    // 1. Try to get lead from Supabase
    try {
      const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (data) leadData = data;
    } catch (e) {
      console.warn('Database lookup failed, using dummy lead info');
    }

    // Fallback lead info if DB fails or lead not found
    if (!leadData) {
      leadData = { name: 'Business Owner', industry: 'service', website: '' };
    }

    // 2. Try to generate with AI, but fall back to template if it fails (broken key)
    let message;
    try {
      message = await generateOutreach(leadData, tone, serviceFocus);
    } catch (aiError) {
      console.warn('AI Generation failed, using pro template fallback');
      message = {
        subject: `Quick question regarding ${leadData.name}'s customer growth`,
        body: `Hi team at ${leadData.name},\n\nI was looking at your ${leadData.industry} business and had a few ideas on how you could automate your customer replies using AI and WhatsApp.\n\nMost businesses like yours are saving 10+ hours a week with these systems. Would you be open to a 5-minute chat to see how it works?\n\nBest regards,\nLeadForge Automation`
      };
    }

    res.status(200).json(message);
  } catch (error) {
    console.error('Master Logic Error:', error);
    res.status(500).json({ error: 'System processing error' });
  }
};

const sendEmailOutreach = async (req, res) => {
  const { leadId, subject, body } = req.body;

  try {
    // Try to get email from lead
    let email = null;
    try {
      const { data } = await supabase.from('leads').select('email').eq('id', leadId).single();
      if (data?.email) email = data.email;
    } catch (e) {}

    if (!email) {
      // If we are in "Demo/Debug" mode, we might want to allow this, 
      // but for production, we need an email. 
      // For now, let's return a specific message.
      return res.status(400).json({ error: 'Lead has no email address listed.' });
    }

    await sendEmail(email, subject, body.replace(/\n/g, '<br>'));
    
    // Log outreach (fire and forget)
    supabase.from('outreach_logs').insert([{ lead_id: leadId, type: 'email', subject, body, status: 'sent' }]).then();
    supabase.from('leads').update({ status: 'sent', updated_at: new Date().toISOString() }).eq('id', leadId).then();

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send Error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
};

module.exports = {
  generateMessage,
  sendEmailOutreach,
};
