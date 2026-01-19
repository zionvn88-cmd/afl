// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://afl-api.neovn524.workers.dev';

export const getApiUrl = (endpoint) => {
  // If endpoint starts with /, remove it
  const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
