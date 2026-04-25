import React, { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

const Discovery = () => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!category || !location) return;
    
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const response = await axios.post('http://localhost:5000/api/leads/discover', {
        category,
        location
      });
      setResults(response.data.leads || []);
    } catch (err) {
      console.error(err);
      setError('Failed to discover leads. Ensure the backend is running and API keys are set.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Lead Discovery</h1>
        <p className="text-gray-500 mt-1">Search Google Places for new business opportunities.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select industry...</option>
                <option value="restaurant">Restaurants & Cafes</option>
                <option value="salon">Hair & Beauty Salons</option>
                <option value="clinic">Medical & Dental Clinics</option>
                <option value="hotel">Boutique Hotels</option>
                <option value="gym">Gyms & Fitness</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="e.g. London, UK"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Discover Leads'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-4xl">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Results ({results.length})</h2>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Auto-saved to Leads</span>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((lead) => (
              <div key={lead.id} className="p-6 flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800">{lead.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {lead.website && (
                      <a href={lead.website} target="_blank" className="flex items-center text-blue-500 hover:underline">
                        <ExternalLink className="w-3 h-3 mr-1" /> Website
                      </a>
                    )}
                    {lead.email && <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Email Found</span>}
                    <span>{lead.phone || 'No Phone'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-600 block">{lead.score} pts</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Match Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && results.length === 0 && (
        <div className="py-20 text-center space-y-4 max-w-4xl">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-400 animate-pulse">Our AI is searching Google and crawling websites for contact info...</p>
        </div>
      )}
    </div>
  );
};

export default Discovery;
