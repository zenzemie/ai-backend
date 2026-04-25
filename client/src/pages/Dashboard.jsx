import React, { useState, useEffect } from 'react';
import { getLeads } from '../api/leads';
import { Users, Mail, Reply, CheckCircle, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    emailsSent: 0,
    replies: 0,
    converted: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getLeads();
      const leads = response.data;
      
      setStats({
        totalLeads: leads.length,
        emailsSent: leads.filter(l => ['sent', 'replied', 'interested', 'converted'].includes(l.status)).length,
        replies: leads.filter(l => ['replied', 'interested', 'converted'].includes(l.status)).length,
        converted: leads.filter(l => l.status === 'converted').length
      });

      setRecentLeads(leads.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
          <p className="text-gray-500 mt-1">Real-time performance of your outreach system.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} color="bg-blue-500" />
        <StatCard title="Emails Sent" value={stats.emailsSent} icon={Mail} color="bg-purple-500" />
        <StatCard title="Replies" value={stats.replies} icon={Reply} color="bg-orange-500" />
        <StatCard title="Converted" value={stats.converted} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-800">Recent Leads</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length > 0 ? recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.industry} • {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right mr-4">
                    <p className="text-xs font-bold text-blue-600">{lead.score} pts</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    lead.status === 'sent' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-400 italic">No activity yet. Go find some leads!</div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg">
          <h3 className="text-xl font-bold mb-4">80/20 Strategy</h3>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Your AI handles 80% of the cold outreach. Focus your remaining 20% on the leads that 
            reply. Prioritize leads with scores over 50 for the best conversion rate.
          </p>
          <ul className="space-y-3">
            {['Personalize subject lines', 'Check website status', 'Mention recent reviews'].map((tip, i) => (
              <li key={i} className="flex items-center text-xs">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-300" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
