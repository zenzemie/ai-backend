import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LeadDetail from './pages/LeadDetail';
import Websites from './pages/Websites';
import WebsiteBuilder from './pages/WebsiteBuilder';
import PublicLandingPage from './pages/PublicLandingPage';

// Agency Pages
import AgencyDashboard from './pages/agency/AgencyDashboard';
import BrandingSettings from './pages/agency/BrandingSettings';

// Context
import { SettingsProvider } from './context/SettingsContext';
import { BrandingProvider } from './context/BrandingContext';

const App = () => {
  return (
    <SettingsProvider>
      <BrandingProvider>
        <Router>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/p/:slug" element={<PublicLandingPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/*"
            element={
              <Layout>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/discovery" element={<Discovery />} />
                    <Route path="/outreach" element={<Leads />} />
                    <Route path="/websites" element={<Websites />} />
                    <Route path="/websites/builder/:id" element={<WebsiteBuilder />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/leads/:id" element={<LeadDetail />} />

                    {/* Agency Routes */}
                    <Route path="/agency" element={<AgencyDashboard />} />
                    <Route path="/agency/branding" element={<BrandingSettings />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            }
          />
        </Routes>
      </Router>
      </BrandingProvider>
    </SettingsProvider>
  );
};

export default App;
