import React from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Key, 
  Database, 
  Zap, 
  Mail, 
  Globe, 
  Eye, 
  EyeOff,
  Save,
  Trash2,
  RefreshCw,
  ToggleLeft as Toggle,
  AlertCircle,
  Palette,
  ChevronRight
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { mockMode, toggleMockMode } = useSettings();
  const navigate = useNavigate();

  const SettingSection = ({ title, description, children, icon }) => (
    <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800/50 rounded-2xl text-zinc-400 group-hover:text-indigo-400 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-zinc-500 font-medium">{description}</p>
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-4">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, placeholder, type = "password", value = "" }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <input 
          type={type} 
          placeholder={placeholder}
          defaultValue={value}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 pr-12 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
        />
        {type === "password" && (
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
            <EyeOff size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          <SettingsIcon size={14} />
          System Configuration
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">System <span className="text-indigo-500">Settings.</span></h1>
        <p className="text-zinc-500 font-medium">Manage your API credentials, system environment, and automation parameters.</p>
      </div>

      <div className="space-y-6">
        {/* Environment Mode */}
        <SettingSection 
          title="Operation Mode" 
          description="Toggle between live API execution and simulated demonstration environment."
          icon={<Zap size={24} />}
        >
          <div className="flex items-center justify-between p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${mockMode ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                <RefreshCw size={20} className={mockMode ? "" : "animate-spin-slow"} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{mockMode ? "Demonstration Mode Active" : "Production Mode Active"}</p>
                <p className="text-xs text-zinc-500 font-medium">{mockMode ? "Simulating all API responses for safety." : "Performing real scans and sending actual emails."}</p>
              </div>
            </div>
            <button 
              onClick={toggleMockMode}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${mockMode ? 'bg-amber-500' : 'bg-indigo-600'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${mockMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {mockMode && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <AlertCircle className="text-amber-500 shrink-0" size={18} />
              <p className="text-xs text-amber-200/70 font-medium leading-relaxed">
                You are currently in <span className="text-amber-500 font-bold uppercase">Mock Mode</span>. No real credits will be consumed from your OpenAI or Resend accounts, and no actual data will be scraped from Google Places.
              </p>
            </div>
          )}
        </SettingSection>

        {/* Agency Branding */}
        <SettingSection 
          title="White Label & Branding" 
          description="Customize the platform identity, colors, and legal information."
          icon={<Palette size={24} />}
        >
          <div className="flex items-center justify-between p-6 bg-zinc-800/30 rounded-2xl border border-zinc-700/50 hover:border-indigo-500/30 transition-all cursor-pointer group"
               onClick={() => navigate('/agency/branding')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-950 rounded-xl text-zinc-500 group-hover:text-indigo-400 transition-colors">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Platform Rebranding Hub</p>
                <p className="text-xs text-zinc-500 font-medium">Configure logos, custom domains, and brand colors.</p>
              </div>
            </div>
            <ChevronRight className="text-zinc-700 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" size={20} />
          </div>
        </SettingSection>

        {/* API Credentials */}
        <SettingSection 
          title="Intelligence API Keys" 
          description="Connect LeadForge to your specialized AI and search providers."
          icon={<Key size={24} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="OpenAI (GPT-4o)" placeholder="sk-..." />
            <InputField label="Google Places API" placeholder="AIza..." />
            <InputField label="Resend (Emails)" placeholder="re_..." />
            <InputField label="System Auth Key" placeholder="Elite_Key_..." />
          </div>
          <div className="pt-4 flex justify-end">
            <button className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
              <Save size={18} />
              Update Credentials
            </button>
          </div>
        </SettingSection>

        {/* Security & Access */}
        <SettingSection 
          title="Database & Storage" 
          description="Manage your persistent lead database and system backups."
          icon={<Database size={24} />}
        >
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                <div className="flex items-center gap-3">
                   <Shield className="text-zinc-500" size={18} />
                   <span className="text-sm font-bold text-zinc-300">Automatic Backups</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full">Every 6 Hours</span>
             </div>
             
             <div className="flex gap-4">
                <button className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-zinc-700">
                  Optimize Database
                </button>
                <button className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-red-500/20 flex items-center justify-center gap-2">
                  <Trash2 size={16} />
                  Purge Old Leads
                </button>
             </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings;
