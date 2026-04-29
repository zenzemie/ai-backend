import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  BarChart3, 
  Globe,
  Settings,
  Zap,
  ChevronRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBranding } from '../../context/BrandingContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Search, label: 'Discovery', path: '/discovery' },
  { icon: MessageSquare, label: 'Outreach', path: '/outreach' },
  { icon: Globe, label: 'Websites', path: '/websites' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: ShieldCheck, label: 'Agency Hub', path: '/agency' },
];

const Sidebar = () => {
  const { branding } = useBranding();
  const [showClientSwitcher, setShowClientSwitcher] = React.useState(false);

  const currentClient = "Gusto Italiano";
  const otherClients = ["Pure Dental", "Luxe Salon", "Iron Gym"];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex flex-col z-50 overflow-hidden group/sidebar transition-all duration-300 ease-in-out lg:translate-x-0 -translate-x-full">
      <div className="p-6 flex items-center gap-3">
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt={branding.platformName} className="w-10 h-10 object-contain" />
        ) : (
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group hover:scale-105"
            style={{ 
              backgroundColor: branding.primaryColor,
              boxShadow: `0 10px 15px -3px ${branding.primaryColor}33`
            }}
          >
            <Zap className="text-white fill-current" size={20} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white">{branding.platformName}</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">{branding.platformSubtitle}</span>
        </div>
      </div>

      {/* Client Switcher */}
      <div className="px-4 mb-4">
        <button 
          onClick={() => setShowClientSwitcher(!showClientSwitcher)}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between hover:bg-zinc-800 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-bold">
              {currentClient.charAt(0)}
            </div>
            <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{currentClient}</span>
          </div>
          <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showClientSwitcher ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showClientSwitcher && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            >
              {otherClients.map(client => (
                <button key={client} className="w-full text-left px-4 py-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border-b border-zinc-800 last:border-0">
                  {client}
                </button>
              ))}
              <button className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-400 hover:bg-zinc-800 transition-all flex items-center gap-2">
                <Plus size={14} />
                Manage All Clients
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group",
              isActive 
                ? "bg-indigo-600/10 text-indigo-400" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-indigo-400" : "text-inherit"} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <ChevronRight size={14} className={cn(
                  "ml-auto opacity-0 group-hover:opacity-100 transition-opacity",
                  isActive && "opacity-100"
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-800/50">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
            isActive 
              ? "bg-indigo-600/10 text-indigo-400" 
              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
          )}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        
        <div className="mt-4 p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Elite Status</p>
            <p className="text-xs text-zinc-400 leading-tight">Your revenue engine is performing 24% above target.</p>
          </div>
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-indigo-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
