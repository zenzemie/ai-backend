require('dotenv').config();
const axios = require('axios');
const OpenAI = require('openai');
const { Resend } = require('resend');

async function testServices() {
  console.log('--- LEADFORGE ENGINE TEST ---');

  // 1. Test Yelp
  try {
    const yelp = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
      params: { term: 'test', location: 'London', limit: 1 }
    });
    console.log('✅ YELP: WORKING');
  } catch (e) {
    console.log('❌ YELP: FAILED -', e.response?.data?.error?.code || e.message);
  }

  // 2. Test OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{role: 'user', content: 'hi'}],
      max_tokens: 5
    });
    console.log('✅ OPENAI: WORKING');
  } catch (e) {
    console.log('❌ OPENAI: FAILED -', e.message);
  }

  // 3. Test Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Just validate key, don't send actual email
    await resend.apiKeys.list();
    console.log('✅ RESEND: WORKING');
  } catch (e) {
    console.log('❌ RESEND: FAILED -', e.message);
  }
}

testServices();
