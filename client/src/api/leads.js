import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_API_AUTH_KEY;

console.log('API config:', {
  url: API_URL,
  hasKey: !!API_KEY
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'x-api-key': API_KEY }),
  },
});

// Interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Leads Management
export const getLeads = () => api.get('/leads');
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (leadData) => api.post('/leads', leadData);
export const updateLead = (id, leadData) => api.patch(`/leads/${id}`, leadData);
export const deleteLead = (id) => api.delete(`/leads/${id}`);

// Discovery & Outreach
export const discoverLeads = (data) => api.post('/leads/discover', data);
export const generateMessage = (data) => api.post('/outreach/generate', data);
export const sendEmailOutreach = (data) => api.post('/outreach/send-email', data);

// Websites & Funnels
export const getWebsites = () => api.get('/websites');
export const getWebsite = (id) => api.get(`/websites/${id}`);
export const generateWebsite = (data) => api.post('/websites/generate', data);
export const updateWebsite = (id, data) => api.put(`/websites/${id}`, data);
export const deleteWebsite = (id) => api.delete(`/websites/${id}`);

export default api;
