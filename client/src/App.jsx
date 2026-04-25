import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Search, BarChart3, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Discovery from './pages/Discovery';
import LeadDetail from './pages/LeadDetail';
import Analytics from './pages/Analytics';

function App() {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Overview" },
    { to: "/discovery", icon: Search, label: "Discovery" },
    { to: "/leads", icon: Users, label: "Leads" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-8 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-black text-xl">L</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-800">LeadForge</h1>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">ME</div>
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-tighter">Project Owner</p>
                <p className="text-[10px] text-gray-400">Marketing Lead</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/:id" element={<LeadDetail />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
