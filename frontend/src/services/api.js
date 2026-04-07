import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Session Health Diagnostics
    const staffToken = localStorage.getItem('staff_token');
    
    let customerToken = null;
    try {
      // Robust key check: Find the first key that looks like rambazar_customer (case-insensitive)
      const storageKey = Object.keys(localStorage).find(k => k.toLowerCase() === 'rambazar_customer');
      if (storageKey) {
        const storedData = localStorage.getItem(storageKey);
        const customerData = JSON.parse(storedData);
        customerToken = customerData?.token || null;
      }
    } catch (e) {
      console.error("[Session] Error parsing token:", e);
    }

    const finalToken = staffToken || customerToken;
    console.log(`[API Request] Token Status: ${finalToken ? '✅ ACTIVE' : '❌ MISSING'} | Path: ${config.url}`);

    if (finalToken && finalToken !== 'null' && finalToken !== '') {
      config.headers['Authorization'] = `Bearer ${finalToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Console log full error for system recovery diagnosis
    console.error(`[API Error] ${error.response?.status} - ${error.config?.url}:`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
