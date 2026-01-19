import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Methods
export const dashboardAPI = {
  getStats: (preset = 'today') => api.get(`/reports/dashboard?preset=${preset}`),
};

export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

export const offersAPI = {
  getAll: (campaignId) => api.get(`/offers?campaign_id=${campaignId}`),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

export const trafficSourcesAPI = {
  getAll: () => api.get('/traffic-sources'),
};

export const reportsAPI = {
  getDashboard: (preset = 'today') => api.get(`/reports/dashboard?preset=${preset}`),
  getCampaignReport: (id, preset = 'today') => 
    api.get(`/reports/campaign/${id}?preset=${preset}`),
};

export const postbackAPI = {
  test: (clickId, payout = 10, status = 'approved') => 
    api.get(`/postback?click_id=${clickId}&payout=${payout}&status=${status}`),
};

export default api;
