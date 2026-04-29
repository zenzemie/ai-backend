import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getLead, 
  generateMessage, 
  sendEmailOutreach,
  generateWebsite 
} from '../api/leads';
import { 
  ChevronLeft, 
  Send, 
  Sparkles, 
  Globe, 
  Phone, 
  Mail, 
  Clock, 
  Database, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Loader2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  MoreVertical,
  Cpu,
  Rocket
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
  const [generatingWebsite, setGeneratingWebsite] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id, mockMode]);

  const fetchLead = async () => {
    setLoading(true);
    if (mockMode) {
       setTimeout(() => {
         setLead({
            id,
            name: 'Apex Fitness Group',
            industry: 'Health & Wellness',
            website: 'https://apexfitness.example.com',
            email: 'contact@apexfitness.example.com',
            phone: '+44 20 7123 4567',
            score: 98,
            status: 'not_contacted',
            notes: 'Business has high review volume but low engagement on automation. Perfect candidate for AI reply systems.',
            created_at: new Date().toISOString()
         });
         setLoading(false);
       }, 800);
       return;
    }
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
    if (mockMode) {
      setTimeout(() => {
        setGeneratedMessage({
          subject: `Automating ${lead?.name || 'your business'}'s growth`,
          body: `Hi ${lead?.name || 'there'},\n\nI noticed you're doing incredible work in the ${lead?.industry || 'industry'} space. However, I also saw some opportunities to streamline your customer replies using AI.\n\nWe build custom ${serviceFocus} solutions that could help you recover roughly 15 hours of staff time per week. Would you be open to a 5-minute demo?\n\nBest,\nLeadForge AI`
        });
        setGenerating(false);
      }, 1500);
      return;
    }
    try {
      const response = await generateMessage({ leadId: id, tone, serviceFocus });
      setGeneratedMessage({ subject: response.data.subject, body: response.data.body });
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    if (mockMode) {
      setTimeout(() => {
        alert('SIMULATED: Outreach transmitted via Resend API.');
        setLead(prev => ({ ...prev, status: 'sent' }));
        setSending(false);
      }, 1000);
      return;
    }
    try {
      await sendEmailOutreach({ leadId: id, subject: generatedMessage.subject, body: generatedMessage.body });
      setLead(prev => ({ ...prev, status: 'sent' }));
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateWebsite = async () => {
    setGeneratingWebsite(true);
    if (mockMode) {
      setTimeout(() => {
        setGeneratingWebsite(false);
        navigate('/websites');
      }, 2000);
      return;
    }
    try {
      const response = await generateWebsite({ leadId: id, templateId: 'elite-v1' });
      navigate(`/websites/builder/${response.data.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to generate website: ' + error.message);
    } finally {
      setGeneratingWebsite(false);
    }
  };

  if (loading) return (
    <div className="py-32 text-center space-y-4">
      <div className="relative inline-block">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={20} />
      </div>
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Accessing Outreach Hub...</p>
    </div>
  );

  if (!lead) return <div className="text-center py-32 text-zinc-500">Lead profile not found in system.</div>;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-all group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
          Return to Leads
        </button>
        
        <div className="flex items-center gap-3">
           <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
             <MoreVertical size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Lead Information */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] space-y-8 relative overflow-hidden backdrop-blur-md"
          >
            <div className="space-y-4 relative z-10">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider",
                lead.status === 'sent' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              )}>
                {lead.status === 'sent' ? <CheckCircle size={12} /> : <Zap size={12} />}
                {lead.status.replace('_', ' ')}
              </div>
              
              <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">{lead.name}</h2>
              <p className="text-zinc-500 font-medium">{lead.industry}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-800 relative z-10">
              <ContactItem icon={<Globe />} value={lead.website} href={lead.website} isLink />
              <ContactItem icon={<Mail />} value={lead.email} />
              <ContactItem icon={<Phone />} value={lead.phone} />
            </div>

            <div className="pt-6 relative z-10">
              <button 
                onClick={handleGenerateWebsite}
                disabled={generatingWebsite}
                className="w-full py-4 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-white transition-all group"
              >
                {generatingWebsite ? (
                  <Loader2 className="animate-spin text-indigo-500" size={18} />
                ) : (
                  <Rocket className="text-indigo-500 group-hover:scale-110 transition-transform" size={18} />
                )}
                {generatingWebsite ? 'Building Funnel...' : 'Launch AI WhatsApp Funnel'}
              </button>
            </div>

            <div className="p-6 bg-zinc-800/30 rounded-3xl border border-zinc-700/50 space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Intelligence Score</span>
                 <span className="text-xl font-bold text-indigo-400">{lead.score}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lead.score}%` }}
                    className="h-full bg-indigo-500"
                 />
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] relative overflow-hidden"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu size={16} className="text-indigo-500" />
              AI Analyst Notes
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              {lead.notes || "No analyst notes available for this lead profile. AI scanning is currently active."}
            </p>
          </motion.div>
        </div>

        {/* Right Column: AI Workspace */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20"
          >
            {/* Workspace Header */}
            <div className="p-6 bg-zinc-900/50 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sales Sequence Generator</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Optimized for Conversion</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={tone} 
                  onChange={(e) => setTone(e.target.value)} 
                  className="bg-zinc-800 border-none rounded-xl text-xs font-bold text-zinc-300 py-2.5 px-4 focus:ring-0 cursor-pointer"
                >
                  <option value="friendly">Friendly</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="formal">Formal</option>
                  <option value="luxury">Luxury Elite</option>
                  <option value="aggressive">Aggressive Hustle</option>
                </select>
                <select 
                  value={serviceFocus} 
                  onChange={(e) => setServiceFocus(e.target.value)} 
                  className="bg-zinc-800 border-none rounded-xl text-xs font-bold text-zinc-300 py-2.5 px-4 focus:ring-0 cursor-pointer"
                >
                  <option value="WhatsApp Automation Bots">WhatsApp Bots</option>
                  <option value="AI Customer Reply Systems">AI Replies</option>
                  <option value="Website Development">Websites</option>
                </select>
                <button 
                  onClick={handleGenerate} 
                  disabled={generating} 
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {generating ? 'Drafting...' : 'Re-Draft AI'}
                </button>
              </div>
            </div>

            {/* Workspace Content */}
            <div className="flex-1 p-8 overflow-y-auto min-h-[500px]">
              <AnimatePresence mode="wait">
                {generatedMessage.body ? (
                  <motion.div 
                    key="editor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Subject Line</label>
                      <input 
                        value={generatedMessage.subject} 
                        onChange={(e) => setGeneratedMessage({...generatedMessage, subject: e.target.value})} 
                        className="w-full text-xl font-bold bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Personalized Pitch</label>
                      <textarea 
                        rows="12" 
                        value={generatedMessage.body} 
                        onChange={(e) => setGeneratedMessage({...generatedMessage, body: e.target.value})} 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-300 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20"
                  >
                    <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-[2rem] flex items-center justify-center text-zinc-700">
                      <MessageSquare size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">AI Sequence Standby</h3>
                      <p className="text-zinc-500 max-w-sm font-medium mx-auto italic">Your personalized sales pitch is ready to be synthesized by the intelligence engine.</p>
                    </div>
                    <button 
                      onClick={handleGenerate} 
                      disabled={generating} 
                      className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
                    >
                      {generating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                      {generating ? 'Drafting Sequence...' : 'Initialize AI Generator'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Workspace Actions */}
            {generatedMessage.body && (
              <div className="p-8 pt-0">
                <button 
                  onClick={handleSend} 
                  disabled={sending || (!mockMode && !lead.email)} 
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-[2rem] font-bold text-lg transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                >
                  {sending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      {lead.email ? 'Transmit via Resend API' : 'No Target Email Found'}
                    </>
                  )}
                </button>
                <p className="text-center mt-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Enterprise Outreach Active</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, value, href, isLink }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-700 transition-colors group-hover:text-indigo-400 group-hover:border-indigo-500/30">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex-1 min-w-0">
      {isLink ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noreferrer" 
          className="text-sm font-bold text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5 truncate underline decoration-zinc-800 underline-offset-4"
        >
          {value || 'Not listed'}
          <ExternalLink size={12} />
        </a>
      ) : (
        <span className="text-sm font-bold text-zinc-400 truncate block">
          {value || <span className="text-amber-500/50 italic font-medium">Pending acquisition...</span>}
        </span>
      )}
    </div>
  </div>
);

export default LeadDetail;
