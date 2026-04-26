const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing. Check your .env file.');
}

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase credentials are missing. Backend will fail on DB operations.');
  // Create a dummy client or just null
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
        order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      }),
      insert: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;
