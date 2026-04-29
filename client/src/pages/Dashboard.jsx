import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import LeadRow from '../components/dashboard/LeadRow';
import QuickPitchModal from '../components/dashboard/QuickPitchModal';
import { useSettings } from '../context/SettingsContext';
import { getStats, getROI } from '../api/analytics';
import { getLeads } from '../api/leads';

const Dashboard = () => {
  const { mockMode } = useSettings();
  const [stats, setStats] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [roiData, setRoiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (mockMode) {
          setStats([
            { title: 'Total Leads Found', value: '1,284', change: '+12.5%', trend: 'up', icon: <Target className="text-indigo-400" />, subValue: 'Discovery' },
            { title: 'AI Outreach Sent', value: '842', change: '+5.2%', trend: 'up', icon: <Zap className="text-purple-400" />, subValue: 'Automated' },
            { title: 'Response Rate', value: '24.8%', change: '+3.1%', trend: 'up', icon: <Users className="text-emerald-400" />, subValue: 'High Impact' },
            { title: 'Projected ROI', value: '12.4x', change: '+0.8%', trend: 'up', icon: <TrendingUp className="text-amber-400" />, subValue: 'Yield' },
          ]);
          setRecentLeads([
            { id: 'mock-1', name: 'Apex Fitness Group', industry: 'Health & Wellness', score: 98, urgency: 'High', website: 'apexfitness.com' },
            { id: 'mock-2', name: 'Skyline Real Estate', industry: 'Property', score: 92, urgency: 'Medium', website: 'skyline.io' },
            { id: 'mock-3', name: 'Modern Dental Clinic', industry: 'Healthcare', score: 87, urgency: 'High', website: 'moderndental.com' },
            { id: 'mock-4', name: 'Luxe Beauty Spa', industry: 'Beauty', score: 85, urgency: 'Low', website: 'luxespa.co' },
          ]);
          setRoiData({
            operationalSavings: 2480,
            hoursSaved: 142,
            totalMoneyRealized: 15400,
            roiMultiple: '12.4x'
          });
        } else {
          const [statsRes, leadsRes, roiRes] = await Promise.all([getStats(), getLeads(), getROI()]);
          const s = statsRes.data;
          const r = roiRes.data;
          setRoiData(r);
          setStats([
            { title: 'Total Leads Found', value: s.leadsFound.toLocaleString(), change: '+12.5%', trend: 'up', icon: <Target className="text-indigo-400" />, subValue: 'Discovery' },
            { title: 'AI Outreach Sent', value: s.emailsSent.toLocaleString(), change: '+5.2%', trend: 'up', icon: <Zap className="text-purple-400" />, subValue: 'Automated' },
            { title: 'Total Revenue', value: `£${r.totalRevenue.toLocaleString()}`, change: '+3.1%', trend: 'up', icon: <TrendingUp className="text-emerald-400" />, subValue: 'Closed' },
            { title: 'ROI Multiple', value: r.roiMultiple, change: '+0.8%', trend: 'up', icon: <CheckCircle2 className="text-amber-400" />, subValue: 'System Yield' },
          ]);
          setRecentLeads(leadsRes.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mockMode]);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <section className="relative p-8 rounded-[2rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-600/20 group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-100 font-bold uppercase tracking-[0.2em] text-[10px]">
              <Sparkles size={14} className="animate-pulse" />
              Intelligence Engine Live
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Welcome back, LeadForge.</h2>
            <p className="text-indigo-100/80 max-w-xl text-lg font-medium">
              Your AI agents found <span className="text-white font-bold underline decoration-indigo-400 underline-offset-4">{mockMode ? '42' : recentLeads.length} new high-value opportunities</span> in the last 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2">
              Start New Discovery <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20" />
      </section>

      {/* ROI & Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Leads Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Active Opportunities</h3>
              <p className="text-sm text-zinc-500 font-medium">Prioritized by revenue potential and urgency</p>
            </div>
            <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors px-4 py-2 bg-indigo-400/5 rounded-xl border border-indigo-400/10">
              View Database
            </button>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Business Detail</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Opportunity Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Urgency</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} onSelect={handleLeadSelect} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: System Health / ROI Widget */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl relative overflow-hidden group">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              AI Impact Projection
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Operational Savings</div>
                <div className="text-2xl font-bold text-emerald-400">£{(roiData?.operationalSavings || 0).toLocaleString()} <span className="text-xs text-zinc-500 font-normal ml-1">/ lifetime</span></div>
                <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-emerald-500" />
                </div>
              </div>

              <div className="p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Time Recovered</div>
                <div className="text-2xl font-bold text-indigo-400">{roiData?.hoursSaved || 0} hrs <span className="text-xs text-zinc-500 font-normal ml-1">/ lifetime</span></div>
                <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-[64%] bg-indigo-500" />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-zinc-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Revenue Realized</div>
                    <div className="text-xs font-bold text-white">£{(roiData?.totalMoneyRealized || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-500/20 font-bold text-xs">
                  {roiData?.roiMultiple || '0.0x'}
                </div>
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px]" />
          </div>

          <div className="p-6 bg-indigo-600 rounded-3xl text-white relative overflow-hidden">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Elite Intelligence</h4>
            <p className="text-lg font-bold leading-tight mb-4">Your personalized AI outreach strategy is currently optimized for WhatsApp conversion.</p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10">
              Review Strategy
            </button>
            <Zap size={120} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
          </div>
        </div>
      </div>

      <QuickPitchModal 
        lead={selectedLead} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
