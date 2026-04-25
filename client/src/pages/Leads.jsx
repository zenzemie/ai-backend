import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '../api/leads';
import { Filter, Search as SearchIcon, ArrowRight, Star } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lead.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredLeads(filtered);
  }, [searchQuery, statusFilter, leads]);

  const fetchLeads = async () => {
    try {
      const response = await getLeads();
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lead Management</h1>
          <p className="text-gray-500 mt-1">Review and qualify your discovered businesses.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search leads by name or industry..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            className="bg-gray-50 border-none rounded-lg py-2 pl-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="not_contacted">Not Contacted</option>
            <option value="sent">Sent</option>
            <option value="replied">Replied</option>
            <option value="interested">Interested</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading leads...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No leads found matching your criteria.</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.industry}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Star className={`w-3 h-3 ${lead.score > 50 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        <span className={`text-sm font-bold ${lead.score > 50 ? 'text-blue-600' : 'text-gray-600'}`}>{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium uppercase tracking-tighter">
                      <span className={`px-2 py-1 rounded-md ${
                        lead.status === 'sent' ? 'bg-blue-50 text-blue-600' : 
                        lead.status === 'not_contacted' ? 'bg-gray-100 text-gray-500' : 
                        'bg-green-50 text-green-600'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;
