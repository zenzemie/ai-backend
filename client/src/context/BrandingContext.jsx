import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    platformName: 'LeadForge',
    platformSubtitle: 'Intelligence OS',
    logoUrl: null, // If null, use default icon
    primaryColor: '#4f46e5', // indigo-600
    secondaryColor: '#18181b', // zinc-900
    accentColor: '#10b981', // emerald-500
    faviconUrl: null,
    customDomain: null,
  });

  useEffect(() => {
    // Inject CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', branding.primaryColor);
    root.style.setProperty('--color-secondary', branding.secondaryColor);
    root.style.setProperty('--color-accent', branding.accentColor);
  }, [branding]);

  // Mock fetching branding from an API based on domain or current account
  useEffect(() => {
    // In a real app, we'd check window.location.hostname
    // and fetch specific branding for that domain.
    // For now, we use defaults or localStorage for demo purposes.
    const savedBranding = localStorage.getItem('agencyBranding');
    if (savedBranding) {
      try {
        setBranding(JSON.parse(savedBranding));
      } catch (e) {
        console.error('Failed to parse saved branding', e);
      }
    }
  }, []);

  const updateBranding = (newBranding) => {
    const updated = { ...branding, ...newBranding };
    setBranding(updated);
    localStorage.setItem('agencyBranding', JSON.stringify(updated));
  };

  const resetBranding = () => {
    const defaults = {
      platformName: 'LeadForge',
      platformSubtitle: 'Intelligence OS',
      logoUrl: null,
      primaryColor: '#4f46e5',
      secondaryColor: '#18181b',
      accentColor: '#10b981',
      faviconUrl: null,
      customDomain: null,
    };
    setBranding(defaults);
    localStorage.removeItem('agencyBranding');
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
