import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use production Render URL
export const BASE_URL = 'https://padmavati-backend-gqua.onrender.com';
export const API_URL = `${BASE_URL}/api`;

export const getImageUrl = (url) => {
  if (!url) return '';
  // If the database has an old localhost or Wi-Fi URL, replace everything before /uploads/ with BASE_URL
  if (url.includes('/uploads/')) {
    const path = url.substring(url.indexOf('/uploads/'));
    return `${BASE_URL}${path}`;
  }
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const staffToken = await SecureStore.getItemAsync('staff_token');
      
      let customerToken = null;
      const storedData = await SecureStore.getItemAsync('rambazar_customer');
      if (storedData) {
        const customerData = JSON.parse(storedData);
        customerToken = customerData?.token || null;
      }

      const finalToken = staffToken || customerToken;
      console.log(`[API Request] Token Status: ${finalToken ? '✅ ACTIVE' : '❌ MISSING'} | Path: ${config.url}`);

      if (finalToken && finalToken !== 'null' && finalToken !== '') {
        config.headers['Authorization'] = `Bearer ${finalToken}`;
      }
    } catch (e) {
      console.error("[Session] Error parsing token:", e);
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
    console.error(`[API Error] ${error.response?.status} - ${error.config?.url}:`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
