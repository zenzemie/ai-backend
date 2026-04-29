import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const getPageTitle = (path) => {
    if (path.startsWith('/websites/builder')) return 'AI Experience Editor';
    if (path.startsWith('/agency/branding')) return 'White Label Settings';
    if (path.startsWith('/agency')) return 'Agency Hub';
    
    switch (path) {
      case '/': return 'Overview';
      case '/discovery': return 'Discovery Engine';
      case '/outreach': return 'Outreach & 80/20 Hub';
      case '/websites': return 'Websites & Funnels';
      case '/analytics': return 'Performance Analytics';
      case '/settings': return 'System Settings';
      default: return 'Intelligence OS';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 flex">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
