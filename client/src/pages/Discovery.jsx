import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2, CheckCircle, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { discoverLeads } from '../api/leads';

const Discovery = () => {
  const navigate = useNavigate();
  const { mockMode } = useSettings();
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
      const response = await discoverLeads({ category, location });
      setResults(response.data.leads || []);
    } catch (err) {
      console.error(err);
      setError('Connection Error: Make sure your API keys are set in Render.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Discovery Engine</h1>
          <p className="text-slate-500 mt-2 font-medium">Find high-value businesses ready for automation.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Powered by Yelp AI</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-2 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              placeholder="What business? (e.g. Italian Restaurant)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              placeholder="Where? (e.g. Manchester, UK)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-10">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Find Leads'}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {loading && results.length === 0 ? (
        <div className="py-24 text-center space-y-6">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
             <Loader2 className="w-16 h-16 animate-spin text-indigo-600 relative mx-auto" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Scouring the web for contact info...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((lead) => (
            <div key={lead.id} className="glass-card p-6 flex flex-col justify-between hover:border-indigo-300 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 uppercase">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-indigo-600 block">{lead.score}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
                  <div className="flex items-center text-slate-400 text-xs font-bold mt-1">
                    <MapPin className="w-3 h-3 mr-1" /> {location}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {lead.website ? <span className="status-badge bg-green-50 text-green-600">Website Found</span> : <span className="status-badge bg-amber-50 text-amber-600 text-[9px]">Missing Website</span>}
                  {lead.phone && <span className="status-badge bg-blue-50 text-blue-600">Phone Available</span>}
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="mt-8 w-full btn-secondary text-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
              >
                Start AI Outreach <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center border-red-100 bg-red-50">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-400 italic">Target an industry and location to begin...</h2>
        </div>
      )}
    </div>
  );
};

export default Discovery;
