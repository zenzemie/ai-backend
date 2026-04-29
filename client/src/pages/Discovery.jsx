import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  Target, 
  Globe,
  Zap,
  Filter,
  BarChart3,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { discoverLeads } from '../api/leads';

const Discovery = () => {
  const navigate = useNavigate();
  const { mockMode } = useSettings();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    if (mockMode) {
      setTimeout(() => {
        setResults([
          { id: 'demo-1', name: 'Elite Dental Care', score: 95, industry: category || 'Healthcare', website: 'https://example.com', phone: '020 1234 5678', revenuePotential: 'High', urgency: 'High' },
          { id: 'demo-2', name: 'The Golden Cafe & Bistro', score: 82, industry: category || 'Hospitality', website: 'https://cafe.com', phone: '020 8765 4321', revenuePotential: 'Medium', urgency: 'Medium' },
          { id: 'demo-3', name: 'Apex Fitness Center', score: 91, industry: category || 'Fitness', website: 'https://apexfit.com', phone: '020 5555 1234', revenuePotential: 'High', urgency: 'High' }
        ]);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const response = await discoverLeads({ category, location });
      setResults(response.data.leads || []);
    } catch (err) {
      console.error(err);
      setResults([{ id: 'demo-err', name: 'Fallback Result', score: 50, industry: category, notes: 'API Error Fallback' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            <Target size={14} />
            Lead Discovery Engine
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Find your next <span className="text-indigo-500">big win.</span></h1>
          <p className="text-zinc-500 max-w-xl font-medium">Search the public web for businesses that need your specific services. AI-powered qualification included.</p>
        </div>
      </div>

      {/* Search Bar Section */}
      <motion.div 
        layout
        className="p-2 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] shadow-2xl shadow-black/20 backdrop-blur-md"
      >
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full relative group">
            <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              className="w-full bg-transparent p-6 pl-14 text-white font-medium placeholder:text-zinc-600 focus:outline-none" 
              placeholder="Industry (e.g. Restaurants, Law Firms...)" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              required 
            />
          </div>
          <div className="hidden md:block w-[1px] h-10 bg-zinc-800" />
          <div className="flex-1 w-full relative group">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              className="w-full bg-transparent p-6 pl-14 text-white font-medium placeholder:text-zinc-600 focus:outline-none" 
              placeholder="City or Region..." 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white p-6 px-10 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Search size={20} />
                <span>Initialize Discovery</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">AI Scanners Active</h3>
              <p className="text-zinc-500 max-w-xs mx-auto">Sifting through public business data and calculating opportunity scores...</p>
            </div>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {results.map((lead, i) => (
              <motion.div 
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl hover:border-indigo-500/50 transition-all relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:scale-110 transition-transform">
                      <Globe className="text-zinc-400 group-hover:text-indigo-400 transition-colors" size={24} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Opportunity</div>
                      <div className="text-2xl font-bold text-white tracking-tighter">{lead.opportunityScore || lead.score || 0}%</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 mb-8">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{lead.name}</h3>
                    <p className="text-sm font-medium text-zinc-500">{lead.industry}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                      <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Revenue</div>
                      <div className="text-xs font-bold text-zinc-300">{lead.revenuePotential}</div>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                      <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Urgency</div>
                      <div className="text-xs font-bold text-zinc-300">{lead.urgency}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/leads/${lead.id}`)} 
                    className="w-full py-4 bg-zinc-800 group-hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg group-hover:shadow-indigo-600/20"
                  >
                    Open Outreach Hub <ArrowRight size={16} />
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
              </motion.div>
            ))}
          </motion.div>
        ) : searched ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">No matches found</h3>
            <p className="text-zinc-500">Try broadening your search criteria or changing the location.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl h-64" />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discovery;
