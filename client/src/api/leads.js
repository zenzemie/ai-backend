import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_API_AUTH_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'x-api-key': API_KEY }),
  },
});

// Leads Management
export const getLeads = () => api.get('/leads');
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (leadData) => api.post('/leads', leadData);
export const updateLead = (id, leadData) => api.patch(`/leads/${id}`, leadData);
export const deleteLead = (id) => api.delete(`/leads/${id}`);

// Discovery & Outreach (THESE WERE MISSING)
export const discoverLeads = (data) => api.post('/leads/discover', data);
export const generateMessage = (data) => api.post('/outreach/generate', data);
export const sendEmailOutreach = (data) => api.post('/outreach/send-email', data);

export default api;
