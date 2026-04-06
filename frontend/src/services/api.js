import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Priority: staff token (Admin/Rider) > customer token
    const staffToken = localStorage.getItem('staff_token');
    
    let customerToken = null;
    try {
      const customerData = JSON.parse(localStorage.getItem('rambazar_customer'));
      customerToken = customerData?.token || null;
    } catch (_) {}

    const finalToken = staffToken || customerToken;

    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
