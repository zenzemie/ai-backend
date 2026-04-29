import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Globe, 
  Upload, 
  RefreshCw, 
  Save,
  Check,
  Type,
  Layout
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

const BrandingSettings = () => {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [form, setForm] = useState({ ...branding });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateBranding(form);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default LeadForge branding?')) {
      resetBranding();
      setForm({
        platformName: 'LeadForge',
        platformSubtitle: 'Intelligence OS',
        logoUrl: null,
        primaryColor: '#4f46e5',
        secondaryColor: '#18181b',
        accentColor: '#10b981',
        faviconUrl: null,
        customDomain: null,
      });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">White Label Settings</h1>
        <p className="text-zinc-500 mt-1">Rebrand the entire platform to your agency's identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Identity */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Type className="text-indigo-500" size={20} />
              <h2 className="text-xl font-bold text-white">Platform Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Platform Name</label>
                <input 
                  type="text" 
                  value={form.platformName}
                  onChange={(e) => setForm({...form, platformName: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. LeadForge"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Platform Subtitle</label>
                <input 
                  type="text" 
                  value={form.platformSubtitle}
                  onChange={(e) => setForm({...form, platformSubtitle: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Intelligence OS"
                />
              </div>
            </div>
          </section>

          {/* Visual Branding */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="text-indigo-500" size={20} />
              <h2 className="text-xl font-bold text-white">Visual Branding</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={form.primaryColor}
                    onChange={(e) => setForm({...form, primaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={form.primaryColor}
                    onChange={(e) => setForm({...form, primaryColor: e.target.value})}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={form.secondaryColor}
                    onChange={(e) => setForm({...form, secondaryColor: e.target.value})}
                    className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={form.secondaryColor}
                    onChange={(e) => setForm({...form, secondaryColor: e.target.value})}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={form.accentColor}
                    onChange={(e) => setForm({...form, accentColor: e.target.value})}
                    className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={form.accentColor}
                    onChange={(e) => setForm({...form, accentColor: e.target.value})}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Platform Logo</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all group">
                  <Upload className="text-zinc-600 mb-4 group-hover:text-indigo-400 transition-colors" size={32} />
                  <p className="text-sm text-zinc-400 text-center">Drag and drop your logo or <span className="text-indigo-400">browse</span></p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-mono">PNG, SVG or WEBP (Max 2MB)</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Favicon</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all group">
                  <Layout className="text-zinc-600 mb-4 group-hover:text-indigo-400 transition-colors" size={32} />
                  <p className="text-sm text-zinc-400 text-center">Upload <span className="text-indigo-400">favicon</span></p>
                  <p className="text-[10px] text-zinc-600 mt-2 font-mono">ICO or PNG (32x32px)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Domain Settings */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Globe className="text-indigo-500" size={20} />
                <h2 className="text-xl font-bold text-white">Custom Domain</h2>
              </div>
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase">Enterprise</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Host LeadForge on your own domain or subdomain (e.g. portal.youragency.com).</p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={form.customDomain || ''}
                  onChange={(e) => setForm({...form, customDomain: e.target.value})}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="portal.agency.com"
                />
                <button className="bg-zinc-800 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-all">
                  Verify
                </button>
              </div>
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">DNS Config Required:</p>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-zinc-400">Type: CNAME</span>
                  <span className="text-zinc-400">Name: portal</span>
                  <span className="text-indigo-400">Value: cname.leadforgeai.com</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-4">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
            >
              <RefreshCw size={18} />
              Reset to Defaults
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${saved ? 'bg-emerald-600' : ''}`}
              style={{ backgroundColor: saved ? undefined : branding.primaryColor, boxShadow: `${branding.primaryColor}33 0px 10px 20px` }}
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : (saved ? <Check size={18} /> : <Save size={18} />)}
              {saving ? 'Saving...' : (saved ? 'Branding Updated' : 'Save All Changes')}
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Preview</label>
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="ml-2 flex-1 bg-zinc-950 rounded-md h-6 flex items-center px-3 text-[10px] text-zinc-500 font-mono overflow-hidden whitespace-nowrap">
                  {form.customDomain || 'app.leadforgeai.com'}
                </div>
              </div>
              <div className="flex h-[500px]">
                {/* Mock Sidebar */}
                <div className="w-20 border-r border-zinc-800 flex flex-col items-center py-6 gap-6">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    <RefreshCw className="text-white" size={20} />
                  </div>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-xl ${i === 1 ? 'bg-zinc-800' : ''}`} />
                  ))}
                </div>
                {/* Mock Dashboard */}
                <div className="flex-1 p-6 space-y-6">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                    <div className="h-2 w-48 bg-zinc-900 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-2">
                      <div className="h-2 w-12 bg-zinc-800 rounded" />
                      <div className="h-6 w-20 bg-zinc-800 rounded" />
                    </div>
                    <div className="h-24 bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-2">
                      <div className="h-2 w-12 bg-zinc-800 rounded" />
                      <div className="h-6 w-20 bg-zinc-800 rounded" />
                    </div>
                  </div>
                  <div className="h-32 bg-zinc-900 rounded-2xl border border-zinc-800" />
                  <div 
                    className="h-10 w-full rounded-xl shadow-lg"
                    style={{ backgroundColor: form.primaryColor }}
                  />
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Mock Interface Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
