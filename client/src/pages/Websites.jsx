import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Globe, MessageSquare, ExternalLink, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Websites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      // Mocking for now, replace with actual API call
      // const res = await fetch('/api/websites');
      // const data = await res.json();
      // setWebsites(data);
      
      setTimeout(() => {
        setWebsites([
          {
            id: '1',
            title: 'Gusto Italiano Landing Page',
            slug: 'gusto-italiano',
            status: 'PUBLISHED',
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Zen Spa & Wellness',
            slug: 'zen-spa',
            status: 'DRAFT',
            updatedAt: new Date().toISOString(),
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Website & Funnel Builder</h1>
          <p className="text-zinc-400 mt-1">Generate high-conversion WhatsApp-first landing pages in seconds.</p>
        </div>
        <button 
          onClick={() => navigate('/discovery')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={20} />
          Generate New Page
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-zinc-500">Loading your Growth OS assets...</p>
        </div>
      ) : websites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((site) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group"
            >
              <div className="aspect-video bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                <Globe className="w-12 h-12 text-zinc-700 group-hover:text-indigo-500/30 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => navigate(`/websites/builder/${site.id}`)}
                      className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <a 
                      href={`/p/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-zinc-800 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-zinc-700 transition-colors"
                    >
                      <ExternalLink size={14} />
                      View
                    </a>
                  </div>
                </div>
                {site.status === 'PUBLISHED' && (
                  <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Live
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white truncate">{site.title}</h3>
                <p className="text-zinc-500 text-sm mt-1 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  WhatsApp Funnel Active
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Updated {new Date(site.updatedAt).toLocaleDateString()}</span>
                  <button className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 mb-2">
            <Globe size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">No landing pages yet</h2>
          <p className="text-zinc-400 max-w-md">Start by finding a lead in the Discovery Engine and we'll generate a high-conversion funnel for them automatically.</p>
          <button 
            onClick={() => navigate('/discovery')}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Go to Discovery
          </button>
        </div>
      )}
    </div>
  );
};

export default Websites;
