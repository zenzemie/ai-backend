import api from './leads';

export const getStats = () => api.get('/analytics/stats');
export const getIndustries = () => api.get('/analytics/industries');
export const getROI = () => api.get('/analytics/roi');
