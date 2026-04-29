import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search as SearchIcon, 
  ArrowRight, 
  Database, 
  Users, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  Mail,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getLeads } from '../api/leads';

const Leads = () => {
  const { mockMode } = useSettings();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, [mockMode]);

  useEffect(() => {
    const filtered = leads.filter(lead => {
      const name = lead.name || '';
      const industry = lead.industry || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredLeads(filtered);
  }, [searchQuery, statusFilter, leads]);

  const fetchLeads = async () => {
    setLoading(true);
    if (mockMode) {
      setTimeout(() => {
        const mockLeads = [
          { id: '1', name: 'Elite Salon & Spa', industry: 'Beauty', score: 88, status: 'sent', revenuePotential: 'High', created_at: new Date().toISOString() },
          { id: '2', name: 'City Dental Practice', industry: 'Healthcare', score: 75, status: 'replied', revenuePotential: 'Medium', created_at: new Date().toISOString() },
          { id: '3', name: 'The Hub Coffee Roasters', industry: 'Hospitality', score: 92, status: 'converted', revenuePotential: 'High', created_at: new Date().toISOString() },
          { id: '4', name: 'Apex Fitness Center', industry: 'Fitness', score: 95, status: 'not_contacted', revenuePotential: 'High', created_at: new Date().toISOString() },
          { id: '5', name: 'Skyline Architects', industry: 'Professional Services', score: 65, status: 'not_contacted', revenuePotential: 'Medium', created_at: new Date().toISOString() },
        ];
        setLeads(mockLeads);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await getLeads();
      setLeads(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    sent: <Mail size={12} />,
    replied: <MessageSquare size={12} />,
    converted: <CheckCircle2 size={12} />,
    not_contacted: <Clock size={12} />
  };

  const statusColors = {
    sent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    replied: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    not_contacted: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            <Users size={14} />
            Lead Management
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Outreach <span className="text-indigo-500">Hub.</span></h1>
          <p className="text-zinc-500 max-w-xl font-medium">Manage your qualified leads, track outreach status, and initialize AI sales sequences.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
           <button className="px-4 py-2 bg-zinc-800 rounded-xl text-xs font-bold text-white shadow-lg">List View</button>
           <button className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300">Kanban Board</button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search leads by name, industry, or notes..."
            className="w-full pl-12 pr-4 py-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white font-medium placeholder:text-zinc-600 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select 
              className="w-full pl-10 pr-10 py-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none text-sm font-bold text-zinc-300 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="sent">Sent</option>
              <option value="replied">Replied</option>
              <option value="converted">Converted</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          
          <button className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all">
            <Database size={20} />
          </button>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-8 py-6">Identity & Industry</th>
                <th className="px-8 py-6">Intelligence Score</th>
                <th className="px-8 py-6">Revenue Potential</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Accessing LeadForge Database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center">
                      <p className="text-zinc-500 font-medium italic">No leads found matching your current filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, i) => (
                    <motion.tr 
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.3)' }}
                      className="group transition-all cursor-pointer"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-zinc-500 border border-zinc-700 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                             {lead.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight mb-1">{lead.name}</p>
                             <p className="text-xs font-medium text-zinc-500">{lead.industry}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${lead.score}%` }}
                               className="h-full bg-indigo-500"
                             />
                          </div>
                          <span className="text-xs font-mono font-bold text-zinc-400">{lead.score}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${lead.revenuePotential === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                           <span className="text-xs font-bold text-zinc-300">{lead.revenuePotential} Potential</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${statusColors[lead.status] || statusColors.not_contacted}`}>
                          {statusIcons[lead.status] || statusIcons.not_contacted}
                          {lead.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all">
                            <Zap size={16} />
                          </button>
                          <button className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all shadow-lg shadow-indigo-600/20">
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer */}
        {!loading && filteredLeads.length > 0 && (
          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Showing {filteredLeads.length} total qualified leads</p>
            <div className="flex items-center gap-2">
               <button disabled className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-zinc-600">Previous</button>
               <button disabled className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-zinc-300">Next Page</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
