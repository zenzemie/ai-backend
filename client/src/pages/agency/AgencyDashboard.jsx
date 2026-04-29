import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  DollarSign, 
  MoreHorizontal,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Palette
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { useNavigate } from 'react-router-dom';

const AgencyDashboard = () => {
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Active Clients', value: '24', icon: Users, trend: '+3 this month' },
    { label: 'Agency Leads', value: '12,482', icon: Search, trend: '+12% vs last month' },
    { label: 'Outreach Vol', value: '8,291', icon: Mail, trend: '98% deliverability' },
    { label: 'Avg Response', value: '18.4%', icon: MessageSquare, trend: '+2.1% trend' },
    { label: 'Est. Revenue', value: '$14,200', icon: DollarSign, trend: 'MRR Growth' },
  ];

  const clients = [
    { id: 1, name: 'Gusto Italiano', industry: 'Restaurant', leads: 450, outreach: 380, replyRate: '22%', status: 'Active', manager: 'Alex' },
    { id: 2, name: 'Pure Dental', industry: 'Clinic', leads: 280, outreach: 150, replyRate: '14%', status: 'Active', manager: 'Sarah' },
    { id: 3, name: 'Luxe Salon', industry: 'Salon', leads: 190, outreach: 185, replyRate: '31%', status: 'At Risk', manager: 'Alex' },
    { id: 4, name: 'Iron Gym', industry: 'Gym', leads: 520, outreach: 410, replyRate: '19%', status: 'Active', manager: 'Mike' },
    { id: 5, name: 'Elite Courier', industry: 'Logistics', leads: 120, outreach: 110, replyRate: '8%', status: 'Churned', manager: 'Sarah' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Agency Hub</h1>
          <p className="text-zinc-500 mt-1">Manage your multi-tenant growth engine and client health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/agency/branding')}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all"
          >
            <Palette size={18} />
            Branding
          </button>
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
            <Filter size={18} />
            Filters
          </button>
          <button 
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: branding.primaryColor, boxShadow: `${branding.primaryColor}33 0px 10px 20px` }}
          >
            <Plus size={18} />
            Add New Client
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}
              >
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              <p className="text-[10px] text-zinc-500 mt-2 font-medium">{stat.trend}</p>
            </div>
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          </motion.div>
        ))}
      </motion.div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Client Health Matrix</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-zinc-800">
                <th className="px-6 py-4 font-bold">Client Name</th>
                <th className="px-6 py-4 font-bold">Industry</th>
                <th className="px-6 py-4 font-bold">Leads Found</th>
                <th className="px-6 py-4 font-bold">Reply Rate</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Manager</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {clients.map((client) => (
                <tr key={client.id} className="group hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        {client.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-white">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">{client.industry}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">{client.leads}</span>
                      <span className="text-[10px] text-zinc-500">{client.outreach} contacted</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: client.replyRate }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-300">{client.replyRate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      client.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                      client.status === 'At Risk' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-400">{client.manager}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-xs text-zinc-500">Showing 5 of 24 clients</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-500 hover:bg-zinc-800 transition-all disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
