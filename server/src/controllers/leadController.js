const supabase = require('../config/supabase');
const { searchBusinesses, calculateScore } = require('../services/discoveryService');

const discoverLeads = async (req, res) => {
  const { category, location } = req.body;

  try {
    console.log(`Starting discovery for ${category} in ${location}...`);
    const businesses = await searchBusinesses(category, location);
    
    if (!businesses || businesses.length === 0) {
      return res.status(200).json({ message: 'No businesses found.', leads: [] });
    }

    const processedLeads = [];

    for (const business of businesses) {
      const score = calculateScore(business);
      
      const leadData = {
        id: business.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        name: business.name,
        website: business.url,
        phone: business.display_phone || null,
        email: null, // Yelp doesn't give email, requires crawler later
        industry: category,
        score: score,
        status: 'not_contacted',
        notes: `Rating: ${business.rating}, Reviews: ${business.review_count}`
      };

      // ATTEMPT to save to DB, but don't stop the request if it fails
      supabase.from('leads').insert([leadData]).then(({ error }) => {
        if (error) console.warn('Supabase Lead Save skipped/failed:', error.message);
      });

      processedLeads.push(leadData);
    }

    res.status(200).json({
      message: `Found ${processedLeads.length} leads.`,
      leads: processedLeads
    });

  } catch (error) {
    console.error('Discovery Engine Error:', error.message);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
};

module.exports = {
  discoverLeads,
  getAllLeads: async (req, res) => {
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json(data || []);
    } catch (e) {
      // Fallback to empty list so UI doesn't crash
      res.status(200).json([]);
    }
  },
  getLeadById: async (req, res) => {
    const { id } = req.params;
    try {
      const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
      if (error || !data) {
         // If not in DB, create a temporary one so the Hub can open
         return res.status(200).json({
           id,
           name: 'Recent Lead',
           industry: 'Service',
           status: 'not_contacted',
           score: 50
         });
      }
      res.status(200).json(data);
    } catch (e) {
      res.status(200).json({ id, name: 'Lead', score: 0 });
    }
  },
  updateLead: async (req, res) => {
    try {
      await supabase.from('leads').update(req.body).eq('id', req.params.id);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(200).json({ success: false });
    }
  },
  deleteLead: async (req, res) => {
    try {
      await supabase.from('leads').delete().eq('id', req.params.id);
      res.status(204).send();
    } catch (e) {
      res.status(204).send();
    }
  }
};
