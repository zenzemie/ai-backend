import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Search, BarChart, Database, Server, User } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Discovery from './pages/Discovery';
import LeadDetail from './pages/LeadDetail';
import Analytics from './pages/Analytics';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </Link>
  );
};

const AppContent = () => {
  const { mockMode, setMockMode } = useSettings();
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">L</span>
          </div>
          <h1 className="text-xl font-black tracking-tight">LeadForge</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink to="/" icon={LayoutDashboard} label="Overview" />
          <SidebarLink to="/discovery" icon={Search} label="Discovery" />
          <SidebarLink to="/leads" icon={Users} label="Leads" />
          <SidebarLink to="/analytics" icon={BarChart} label="Analytics" />
        </nav>
        <div className="p-4 border-t">
           <button onClick={() => setMockMode(!mockMode)} className={`w-full py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest ${mockMode ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
             {mockMode ? 'Demo Mode Active' : 'Live Engine Active'}
           </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-12">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}
