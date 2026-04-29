import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Send, 
  Settings, 
  Smartphone, 
  Monitor, 
  Loader2, 
  Check,
  ChevronRight,
  MessageSquare,
  Layout,
  Type,
  Palette,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  MessageCircle,
  Globe
} from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

const WebsiteBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { branding } = useBranding();
  
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'theme', 'settings'
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    // Mocking fetch - in real app, fetch from /api/websites/:id
    setTimeout(() => {
      setWebsite({
        id,
        title: 'Gusto Italiano Landing Page',
        slug: 'gusto-italiano',
        content: {
          hero: {
            badge: 'Experience Elite Dining',
            headline: 'The Most Authentic Italian Experience in London',
            subheadline: 'Hand-crafted pasta, wood-fired pizza, and an atmosphere that transports you to the heart of Rome.',
            ctaText: 'Book via WhatsApp'
          },
          gap: {
            problem: 'Tired of complicated booking systems and long wait times?',
            solution: 'Our AI-powered WhatsApp assistant handles your reservations 24/7. Just one message and you\'re in.'
          },
          services: [
            { title: 'Fine Dining', description: 'Experience our full a la carte menu in our premium dining room.', price: 'From £45' },
            { title: 'Wood-Fired Pizza', description: 'Authentic Neapolitan pizza made with imported ingredients.', price: 'From £14' },
            { title: 'Private Events', description: 'Host your special occasions in our exclusive private lounge.', price: 'Enquire' }
          ],
          faq: [
            { question: 'Do you offer vegan options?', answer: 'Yes! We have a dedicated vegan menu featuring plant-based pastas and pizzas.' },
            { question: 'Is there a dress code?', answer: 'We maintain a smart-casual dress code to ensure a premium atmosphere for all guests.' }
          ],
          theme: {
            primaryColor: '#f59e0b',
            accentColor: '#10b981',
            fontFamily: 'Inter'
          },
          whatsapp: {
            phoneNumber: '447000000000',
            prefilledMessage: "Hi! I'd like to book a table at Gusto Italiano."
          }
        }
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  const updateContent = (section, field, value) => {
    setWebsite({
      ...website,
      content: {
        ...website.content,
        [section]: {
          ...website.content[section],
          [field]: value
        }
      }
    });
  };

  const updateService = (index, field, value) => {
    const newServices = [...website.content.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setWebsite({
      ...website,
      content: { ...website.content, services: newServices }
    });
  };

  const addService = () => {
    const newService = { title: 'New Service', description: 'Description here', price: 'Contact us' };
    setWebsite({
      ...website,
      content: { ...website.content, services: [...website.content.services, newService] }
    });
  };

  const removeService = (index) => {
    const newServices = website.content.services.filter((_, i) => i !== index);
    setWebsite({
      ...website,
      content: { ...website.content, services: newServices }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-zinc-950">
        <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
        <p className="text-zinc-500 font-medium animate-pulse">Initializing Elite Builder...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Elite Top Bar */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/websites')}
            className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-zinc-800" />
          <div>
            <h2 className="text-sm font-bold text-white">{website.title}</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">Editing Live Experience</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Monitor size={16} />
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Smartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 text-xs font-bold transition-colors">
            <Eye size={16} />
            PREVIEW
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-zinc-700"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
          <button 
            className="flex items-center gap-2 text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95"
            style={{ backgroundColor: branding.primaryColor, boxShadow: `${branding.primaryColor}44 0px 8px 16px` }}
          >
            <Send size={14} />
            PUBLISH
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Elite Sidebar Editor */}
        <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col z-40">
          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-900 p-2 gap-1">
            {[
              { id: 'content', icon: Layout, label: 'Content' },
              { id: 'theme', icon: Palette, label: 'Design' },
              { id: 'settings', icon: Settings, label: 'Setup' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
              >
                <tab.icon size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'content' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {/* Content Sections Accordion */}
                  {[
                    { id: 'hero', label: 'Hero Section', icon: ImageIcon },
                    { id: 'gap', label: 'The Gap (Problem)', icon: Type },
                    { id: 'services', label: 'Services/Offers', icon: Plus },
                    { id: 'faq', label: 'FAQ Accordion', icon: MessageSquare },
                    { id: 'whatsapp', label: 'WhatsApp Config', icon: MessageCircle }
                  ].map(section => (
                    <div key={section.id} className="space-y-2">
                      <button 
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${activeSection === section.id ? 'bg-indigo-600/10 border-indigo-500/50 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <section.icon size={18} className={activeSection === section.id ? 'text-indigo-400' : ''} />
                          <span className="text-sm font-bold">{section.label}</span>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                      </button>

                      {activeSection === section.id && (
                        <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 space-y-4 mb-4">
                          {section.id === 'hero' && (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Headline</label>
                                <textarea 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none h-24 font-medium"
                                  value={website.content.hero.headline}
                                  onChange={(e) => updateContent('hero', 'headline', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sub-headline</label>
                                <textarea 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
                                  value={website.content.hero.subheadline}
                                  onChange={(e) => updateContent('hero', 'subheadline', e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          {section.id === 'whatsapp' && (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Phone Number</label>
                                <input 
                                  type="text"
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                  value={website.content.whatsapp.phoneNumber}
                                  onChange={(e) => updateContent('whatsapp', 'phoneNumber', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pre-filled Message</label>
                                <textarea 
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none h-20"
                                  value={website.content.whatsapp.prefilledMessage}
                                  onChange={(e) => updateContent('whatsapp', 'prefilledMessage', e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          {section.id === 'services' && (
                            <div className="space-y-6">
                              {website.content.services.map((service, index) => (
                                <div key={index} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3 relative group">
                                  <button 
                                    onClick={() => removeService(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                  <input 
                                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-white outline-none"
                                    value={service.title}
                                    onChange={(e) => updateService(index, 'title', e.target.value)}
                                    placeholder="Service Title"
                                  />
                                  <textarea 
                                    className="w-full bg-transparent border-none p-0 text-xs text-zinc-500 outline-none resize-none h-12"
                                    value={service.description}
                                    onChange={(e) => updateService(index, 'description', e.target.value)}
                                    placeholder="Description"
                                  />
                                </div>
                              ))}
                              <button 
                                onClick={addService}
                                className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 transition-all text-xs font-bold"
                              >
                                + ADD SERVICE
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'theme' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-6"
                >
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Brand Colors</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Primary CTA</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                            value={website.content.theme.primaryColor}
                            onChange={(e) => updateContent('theme', 'primaryColor', e.target.value)}
                          />
                          <span className="text-[10px] font-mono text-zinc-500">{website.content.theme.primaryColor}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Accent</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                            value={website.content.theme.accentColor}
                            onChange={(e) => updateContent('theme', 'accentColor', e.target.value)}
                          />
                          <span className="text-[10px] font-mono text-zinc-500">{website.content.theme.accentColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="p-6 border-t border-zinc-900 mt-auto">
            <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Assistant Ready</p>
                <p className="text-[10px] text-zinc-500">Ready to publish to Vercel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Elite Preview Area */}
        <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto flex flex-col items-center custom-scrollbar scroll-smooth">
          <div 
            className={`bg-zinc-950 rounded-t-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-700 ease-in-out relative overflow-hidden border-x border-t border-zinc-800/50 ${viewMode === 'desktop' ? 'w-full max-w-5xl' : 'w-[375px] h-[750px] self-center rounded-[3rem] border-[12px] border-zinc-900 overflow-y-auto hide-scrollbar'}`}
          >
            {/* Mock Landing Page Render */}
            <div className="relative text-white font-sans overflow-x-hidden">
              {/* Hero */}
              <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-zinc-950">
                 <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
                 </div>

                 <motion.div 
                   key={website.content.hero.headline}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="relative z-10 max-w-3xl"
                 >
                   <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-8">
                     {website.content.hero.badge}
                   </span>
                   <h1 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter mb-8">
                     {website.content.hero.headline}
                   </h1>
                   <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-12">
                     {website.content.hero.subheadline}
                   </p>
                   <button 
                     style={{ 
                       backgroundColor: website.content.theme.primaryColor,
                       boxShadow: `${website.content.theme.primaryColor}44 0px 10px 30px`
                     }}
                     className="px-10 py-5 rounded-full font-black text-lg flex items-center gap-3 mx-auto active:scale-95 transition-all"
                   >
                     <MessageCircle size={24} className="fill-white/20" />
                     {website.content.hero.ctaText}
                   </button>
                 </motion.div>

                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20">
                   <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
                 </div>
              </div>

              {/* The Gap */}
              <div className="py-32 px-8 bg-zinc-900/20">
                <div className="max-w-4xl mx-auto text-center">
                   <h2 className="text-2xl md:text-4xl font-bold mb-12 italic text-zinc-300">
                     "{website.content.gap.problem}"
                   </h2>
                   <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800/50">
                     <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                       {website.content.gap.solution}
                     </p>
                   </div>
                </div>
              </div>

              {/* Services */}
              <div className="py-32 px-8">
                <div className="max-w-5xl mx-auto">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                     <div>
                       <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Exclusives</span>
                       <h2 className="text-3xl md:text-5xl font-bold mt-4 tracking-tight">Our Services</h2>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {website.content.services.map((service, i) => (
                       <div key={i} className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800/50 group hover:border-white/10 transition-all">
                         <div 
                           className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                           style={{ backgroundColor: `${website.content.theme.primaryColor}15`, color: website.content.theme.primaryColor }}
                         >
                           <CheckCircle2 size={24} />
                         </div>
                         <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                         <p className="text-sm text-zinc-500 leading-relaxed mb-8">{service.description}</p>
                         <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                            <span className="font-bold">{service.price}</span>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              {/* Sticky WhatsApp */}
              <div 
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-50 transition-transform hover:scale-110"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle size={32} className="fill-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};

export default WebsiteBuilder;
