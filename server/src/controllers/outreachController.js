const { generateOutreach } = require('../services/openaiService');
const { sendEmail } = require('../services/resendService');
const supabase = require('../config/supabase');

const generateMessage = async (req, res) => {
  const { leadId, tone, serviceFocus } = req.body;

  if (!leadId || !tone) {
    return res.status(400).json({ error: 'leadId and tone are required' });
  }

  try {
    // Fetch lead details from Supabase
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Generate message using OpenAI
    const message = await generateOutreach(lead, tone, serviceFocus);

    res.status(200).json({
      leadId,
      tone,
      serviceFocus,
      subject: message.subject,
      body: message.body,
    });
  } catch (error) {
    console.error('Error in generateMessage controller:', error);
    res.status(500).json({ error: error.message });
  }
};

const sendEmailOutreach = async (req, res) => {
  const { leadId, subject, body } = req.body;

  if (!leadId || !subject || !body) {
    return res.status(400).json({ error: 'leadId, subject, and body are required' });
  }

  try {
    // 1. Fetch lead email
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('email')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead || !lead.email) {
      return res.status(404).json({ error: 'Lead not found or email missing' });
    }

    // 2. Send email via Resend
    await sendEmail(lead.email, subject, body.replace(/\n/g, '<br>'));

    // 3. Log outreach
    const { error: logError } = await supabase
      .from('outreach_logs')
      .insert([
        {
          lead_id: leadId,
          type: 'email',
          subject: subject,
          body: body,
          status: 'sent',
        },
      ]);

    if (logError) console.error('Failed to log outreach:', logError);

    // 4. Update lead status
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (updateError) console.error('Failed to update lead status:', updateError);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in sendEmailOutreach controller:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateMessage,
  sendEmailOutreach,
};
