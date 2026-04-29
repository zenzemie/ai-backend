import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  Users,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getStats, getIndustries, getROI } from '../api/analytics';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Analytics = () => {
  const { mockMode } = useSettings();
  const [stats, setStats] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [roi, setRoi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        if (mockMode) {
          setStats({
            leadsFound: 1248,
            emailsSent: 482,
            repliesReceived: 118,
            convertedClients: 24,
            avgResponse: '12m'
          });
          setIndustries([
            { name: 'Healthcare', count: 442, color: '#6366f1', conversionRate: 5.2 },
            { name: 'Real Estate', count: 218, color: '#8b5cf6', conversionRate: 4.1 },
            { name: 'Law Firms', count: 125, color: '#ec4899', conversionRate: 3.8 },
            { name: 'Retail', count: 92, color: '#f43f5e', conversionRate: 2.9 },
          ]);
          setRoi({
            totalMoneyRealized: 14200,
            operationalSavings: 3800,
            totalRevenue: 10400,
            roiMultiple: '12.4x'
          });
        } else {
          const [statsRes, indRes, roiRes] = await Promise.all([
            getStats(),
            getIndustries(),
            getROI()
          ]);
          setStats(statsRes.data);
          setIndustries(indRes.data);
          setRoi(roiRes.data);
        }
      } catch (err) {
        console.error('Analytics Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [mockMode]);

  const StatBox = ({ title, value, change, icon, colorClass = "text-indigo-400" }) => (
    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-zinc-800/50 rounded-xl group-hover:scale-110 transition-transform">
          {React.cloneElement(icon, { className: colorClass })}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
          <TrendingUp size={12} />
          {change}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
    </div>
  );

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aggregating Revenue Intelligence...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            <BarChart3 size={14} />
            Performance Metrics
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Intelligence <span className="text-indigo-500">Insights.</span></h1>
          <p className="text-zinc-500 max-w-xl font-medium">Real-time analysis of your lead generation and conversion engine performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all">Export PDF</button>
          <button className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">Full Audit</button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox title="Scan Volume" value={stats?.leadsFound?.toLocaleString() || '0'} change="+14.2%" icon={<Target />} />
        <StatBox title="Engaged Leads" value={stats?.emailsSent?.toLocaleString() || '0'} change="+8.1%" icon={<Users />} colorClass="text-purple-400" />
        <StatBox title="Conversion Rate" value={`${((stats?.convertedClients / (stats?.emailsSent || 1)) * 100).toFixed(1)}%`} change="+1.2%" icon={<TrendingUp />} colorClass="text-emerald-400" />
        <StatBox title="ROI Realized" value={`£${(roi?.totalMoneyRealized / 1000).toFixed(1)}k`} change="+12%" icon={<Award />} colorClass="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-indigo-400" size={20} />
              Revenue Conversion Funnel
            </h3>
            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Live Pipeline
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'Market Found', value: stats?.leadsFound, color: 'bg-zinc-800' },
              { label: 'Qualified', value: Math.round(stats?.leadsFound * 0.8), color: 'bg-indigo-900/40' },
              { label: 'Contacted', value: stats?.emailsSent, color: 'bg-indigo-800/40' },
              { label: 'Interested', value: stats?.interestedLeads || Math.round(stats?.emailsSent * 0.2), color: 'bg-indigo-700/40' },
              { label: 'Closed', value: stats?.convertedClients, color: 'bg-emerald-500/40' }
            ].map((step, i) => (
              <div key={i} className="space-y-4 text-center">
                <div className={`aspect-square rounded-3xl ${step.color} border border-white/5 flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
                   <span className="text-2xl font-bold text-white relative z-10">{step.value}</span>
                   <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1 relative z-10">{step.label}</span>
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                </div>
                {i < 4 && <div className="hidden md:flex justify-center"><ArrowUpRight className="text-zinc-800 rotate-45" size={20} /></div>}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Overall Efficiency</p>
              <p className="text-2xl font-bold text-white">{roi?.roiMultiple || '0.0x'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Staff Time Saved</p>
              <p className="text-2xl font-bold text-indigo-400">{roi?.hoursSaved || 0} hrs</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Net Profit Margin</p>
              <p className="text-2xl font-bold text-emerald-400">£{roi?.netProfit?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Industry breakdown */}
        <div className="space-y-6">
          <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] space-y-6 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="text-rose-400" size={18} />
              Industry Performance
            </h3>
            
            <div className="space-y-5">
              {industries.slice(0, 5).map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                    <span className="text-zinc-400">{item.name}</span>
                    <span className="text-white">{item.conversionRate || 0}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(item.count, 100)}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-zinc-800 mt-6">
              <div className="flex items-center gap-3 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                 <ShieldCheck className="text-indigo-400" size={20} />
                 <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Top Performer</p>
                    <p className="text-sm font-bold text-white">{industries[0]?.name || 'N/A'}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
            <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
            <div className="relative z-10 space-y-4">
              <div className="p-2.5 bg-white/10 rounded-xl w-fit">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Lifetime Revenue ROI</h4>
                <p className="text-4xl font-bold tracking-tight">£{(roi?.totalRevenue / 1000).toFixed(1)}k</p>
                <p className="text-xs font-medium opacity-60 mt-2 italic">Calculated from closed high-ticket contracts.</p>
              </div>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl">
                View Full ROI Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
