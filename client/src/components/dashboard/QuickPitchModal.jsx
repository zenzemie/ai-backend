import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, Zap, Copy, Check } from 'lucide-react';
import { generateMessage, sendEmailOutreach } from '../../api/leads';
import { useSettings } from '../../context/SettingsContext';

const QuickPitchModal = ({ lead, isOpen, onClose }) => {
  const { mockMode } = useSettings();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pitch, setPitch] = useState(null);
  const [copied, setCopied] = useState(false);
  const [serviceFocus, setServiceFocus] = useState('WhatsApp Automation Bots');
  const [tone, setTone] = useState('persuasive');

  useEffect(() => {
    if (isOpen && lead) {
      handleGenerate();
    } else {
      setPitch(null);
    }
  }, [isOpen, lead]);

  const handleGenerate = async () => {
    setLoading(true);
    if (mockMode) {
      setTimeout(() => {
        setPitch({
          subject: `Strategic growth for ${lead.name}`,
          body: `Hi ${lead.name} team,\n\nI noticed some significant automation opportunities for your business. We build custom ${serviceFocus} solutions that could help you recover roughly 15 hours of staff time per week.\n\nWould you be open to a 5-minute demo?\n\nBest,\nLeadForge AI`
        });
        setLoading(false);
      }, 1200);
      return;
    }

    try {
      const response = await generateMessage({ 
        leadId: lead.id, 
        tone, 
        serviceFocus 
      });
      setPitch(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    if (mockMode) {
      setTimeout(() => {
        alert('SIMULATED: Outreach transmitted.');
        setSending(false);
        onClose();
      }, 1000);
      return;
    }

    try {
      await sendEmailOutreach({ 
        leadId: lead.id, 
        subject: pitch.subject, 
        body: pitch.body 
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    if (!pitch) return;
    navigator.clipboard.writeText(`${pitch.subject}\n\n${pitch.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">AI Quick Pitch</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{lead?.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Synthesizing Elite Pitch...</p>
                </div>
              ) : pitch ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Subject</div>
                      <div className="text-white font-bold">{pitch.subject}</div>
                    </div>
                    <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl min-h-[200px]">
                      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Message Body</div>
                      <div className="text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                        {pitch.body}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                      {copied ? 'Copied' : 'Copy to Clipboard'}
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                      {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      {sending ? 'Transmitting...' : 'Transmit Outreach'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-[1.5rem] flex items-center justify-center mx-auto text-zinc-700">
                    <Zap size={32} />
                  </div>
                  <p className="text-zinc-500">Failed to initialize pitch engine.</p>
                  <button 
                    onClick={handleGenerate}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
                  >
                    Retry Initialization
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <Zap size={10} /> Powered by LeadForge AI Logic
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickPitchModal;
