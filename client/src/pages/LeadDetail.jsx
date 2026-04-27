import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, generateMessage, sendEmailOutreach } from '../api/leads';
import { ChevronLeft, Send, Sparkles, Globe, Phone, Mail, Clock, Database, CheckCircle, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mockMode } = useSettings();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tone, setTone] = useState('persuasive');
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await generateMessage({ leadId: id, tone, serviceFocus });
      setGeneratedMessage({ subject: response.data.subject, body: response.data.body });
    } catch (error) {
      alert('AI Generation failed. Check API keys.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!window.confirm(`Send this personalized pitch to ${lead.name}?`)) return;
    setSending(true);
    try {
      await sendEmailOutreach({ leadId: id, subject: generatedMessage.subject, body: generatedMessage.body });
      alert('Outreach successful! Status updated.');
      fetchLead();
    } catch (error) {
      alert('Email sending failed. Is your Resend key active?');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest">Opening Outreach Hub...</p>
    </div>
  );

  if (!lead) return <div className="text-center py-20">Lead not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <button onClick={() => navigate('/discovery')} className="flex items-center text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors group">
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Discovery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Lead Intel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 space-y-6 border-l-4 border-l-indigo-500">
            <div>
              <span className="status-badge bg-indigo-50 text-indigo-600 mb-2 inline-block">Verified Lead</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">{lead.name}</h2>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-100 text-sm">
              <div className="flex items-center text-slate-600 font-medium">
                <Globe className="w-5 h-5 mr-3 text-slate-300" />
                <a href={lead.website} target="_blank" rel="noreferrer" className="hover:text-indigo-600 truncate underline decoration-slate-200 uppercase tracking-tighter">{lead.website || 'No website'}</a>
              </div>
              <div className="flex items-center text-slate-600 font-medium">
                <Mail className="w-5 h-5 mr-3 text-slate-300" />
                {lead.email || <span className="text-amber-500 italic">Finding email...</span>}
              </div>
              <div className="flex items-center text-slate-600 font-medium">
                <Phone className="w-5 h-5 mr-3 text-slate-300" />
                {lead.phone || 'No phone'}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opportunity Score</p>
                <p className="text-2xl font-black text-indigo-600">{lead.score}/100</p>
              </div>
              <div className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase ${lead.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {lead.status}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-slate-900 text-white">
            <h3 className="font-bold flex items-center mb-4 text-indigo-400">
              <Zap className="w-4 h-4 mr-2" /> Qualification AI
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "{lead.notes || 'This lead shows high potential for automation services.'}"
            </p>
          </div>
        </div>

        {/* Right: AI Workspace */}
        <div className="lg:col-span-8">
          <div className="glass-card overflow-hidden shadow-2xl shadow-indigo-100/50 flex flex-col h-full">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-800 uppercase tracking-tight">AI Content Engine</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-white border-slate-200 rounded-xl text-xs font-bold py-2">
                  <option value="friendly">Friendly</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="formal">Formal</option>
                </select>
                <select value={serviceFocus} onChange={(e) => setServiceFocus(e.target.value)} className="bg-white border-slate-200 rounded-xl text-xs font-bold py-2">
                  <option value="WhatsApp Automation">WhatsApp Automation</option>
                  <option value="AI Reply System">AI Reply System</option>
                  <option value="Website Development">Website Development</option>
                </select>
                <button onClick={handleGenerate} disabled={generating} className="btn-primary py-2 px-4 text-xs">
                  {generating ? 'Drafting...' : 'Re-Generate'}
                </button>
              </div>
            </div>

            <div className="p-8 flex-1 space-y-6">
              {generatedMessage.subject || generatedMessage.body ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                    <input value={generatedMessage.subject} onChange={(e) => setGeneratedMessage({...generatedMessage, subject: e.target.value})} className="w-full text-xl font-bold border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 p-4" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Personalized Pitch</label>
                    <textarea rows="10" value={generatedMessage.body} onChange={(e) => setGeneratedMessage({...generatedMessage, body: e.target.value})} className="w-full text-slate-700 leading-relaxed border-none bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 p-6 font-medium" />
                  </div>
                  <button onClick={handleSend} disabled={sending || !lead.email} className="w-full btn-primary py-4 text-lg">
                    {sending ? 'Transmitting...' : lead.email ? 'Send via Resend API' : 'No Email Found'}
                  </button>
                </div>
              ) : (
                <div className="py-24 text-center space-y-6 border-2 border-dashed border-slate-100 rounded-3xl">
                   <Zap className="w-12 h-12 text-slate-200 mx-auto" />
                   <div>
                     <p className="text-slate-400 font-bold italic">AI Draft Ready for {lead.name}</p>
                     <button onClick={handleGenerate} disabled={generating} className="btn-primary mt-6 mx-auto px-10">
                       Launch AI Generator
                     </button>
                   </div>
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
