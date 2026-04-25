const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateOutreach = async (lead, tone, serviceFocus) => {
  const { name, website, industry, notes } = lead;

  const systemPrompt = `You are a professional marketing assistant. Your goal is to generate a personalized outreach email for a business.
  
  Services offered:
  - WhatsApp automation bots (reservations, inquiries, order tracking)
  - AI customer reply systems (24/7 support, FAQ handling)
  - Business website development and redesign

  Target context:
  - Restaurants/Cafes: WhatsApp reservations, menu inquiries.
  - Salons: Appointment booking, reminders.
  - Clinics: Patient intake, scheduling, FAQs.
  - Service Providers: Lead capture, appointment setting.

  Rules:
  - Subject line should be catchy but professional.
  - Body should be personalized based on the business name, industry, and any notes provided.
  - Tone should be ${tone} (options: friendly, persuasive, formal).
  ${serviceFocus ? `- Focus specifically on promoting: ${serviceFocus}` : ''}
  - Avoid spammy language. Focus on solving specific pain points (e.g., missing WhatsApp booking, outdated website).
  - High quality and concise.
  - Response must be a JSON object with 'subject' and 'body' fields.`;

  const userPrompt = `Business Name: ${name}
  Industry: ${industry}
  Website: ${website || 'No website listed'}
  Notes: ${notes || 'None provided'}
  
  Generate a personalized outreach email.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating outreach with OpenAI:', error);
    throw new Error('Failed to generate outreach message');
  }
};

module.exports = {
  generateOutreach,
};
