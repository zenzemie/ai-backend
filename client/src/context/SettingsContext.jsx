import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [mockMode, setMockMode] = useState(() => {
    const saved = localStorage.getItem('mockMode');
    return saved ? JSON.parse(saved) : true; // Default to true for better initial demo experience
  });

  useEffect(() => {
    localStorage.setItem('mockMode', JSON.stringify(mockMode));
  }, [mockMode]);

  const toggleMockMode = () => setMockMode(!mockMode);

  return (
    <SettingsContext.Provider value={{ mockMode, setMockMode, toggleMockMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
