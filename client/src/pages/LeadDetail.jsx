import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, updateLead } from '../api/leads';
import axios from 'axios';
import { ChevronLeft, Send, Sparkles, Globe, Phone, Mail, Clock } from 'lucide-react';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState('friendly');
  const [serviceFocus, setServiceFocus] = useState('WhatsApp Automation');
  const [generatedMessage, setGeneratedMessage] = useState({ subject: '', body: '' });
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await getLead(id);
      setLead(response.data);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await axios.post('http://localhost:5000/api/outreach/generate', {
        leadId: id,
        tone: tone,
        serviceFocus: serviceFocus
      });
      setGeneratedMessage({
        subject: response.data.subject,
        body: response.data.body
      });
    } catch (error) {
      alert('Failed to generate message. Check console for details.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await axios.post('http://localhost:5000/api/outreach/send', {
        leadId: id,
        subject: generatedMessage.subject,
        body: generatedMessage.body
      });
      alert('Email sent successfully!');
      fetchLead(); // Refresh to see updated status
    } catch (error) {
      alert('Failed to send email. Check console for details.');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Hub...</div>;
  if (!lead) return <div className="text-center py-10">Lead not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate('/leads')}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Leads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business Context */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{lead.name}</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                {lead.website ? <a href={lead.website} target="_blank" className="text-blue-600 hover:underline">{lead.website}</a> : 'No website'}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                {lead.email || 'Email not found'}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                {lead.phone || 'Phone not found'}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Discovered {new Date(lead.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Score & Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">{lead.score}</span>
                  <span className="text-gray-400 text-xs ml-1">/100</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  lead.status === 'sent' ? 'bg-blue-100 text-blue-700' : 
                  lead.status === 'not_contacted' ? 'bg-gray-100 text-gray-600' : 
                  'bg-green-100 text-green-700'
                }`}>
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3">Qualification Notes</h3>
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "{lead.notes || 'No notes available.'}"
            </p>
          </div>
        </div>

        {/* Right Column: AI Outreach Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-bottom flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold">AI Outreach Assistant</h3>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-500 font-medium uppercase">Tone:</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="text-sm border-gray-300 rounded-md py-1 px-2"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-500 font-medium uppercase">Focus:</label>
                  <select 
                    value={serviceFocus}
                    onChange={(e) => setServiceFocus(e.target.value)}
                    className="text-sm border-gray-300 rounded-md py-1 px-2"
                  >
                    <option value="WhatsApp Automation">WhatsApp Automation</option>
                    <option value="AI Reply System">AI Reply System</option>
                    <option value="Website Development">Website Development</option>
                  </select>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-purple-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {generating ? '...' : 'Re-generate'}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {generatedMessage.subject || generatedMessage.body ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject Line</label>
                    <input 
                      type="text" 
                      value={generatedMessage.subject}
                      onChange={(e) => setGeneratedMessage({...generatedMessage, subject: e.target.value})}
                      className="w-full border-gray-200 rounded-lg text-sm font-semibold focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Message Body</label>
                    <textarea 
                      rows="12"
                      value={generatedMessage.body}
                      onChange={(e) => setGeneratedMessage({...generatedMessage, body: e.target.value})}
                      className="w-full border-gray-200 rounded-lg text-sm leading-relaxed focus:ring-purple-500"
                    />
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={handleSend}
                      disabled={sending || !lead.email}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : lead.email ? 'Send Email via Resend' : 'No Email Found'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 mb-4">No message generated yet.</p>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 shadow-sm"
                  >
                    {generating ? 'Generating...' : 'Generate 80/20 Outreach'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
