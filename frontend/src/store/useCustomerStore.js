import { create } from 'zustand';

// Store for customer details (persisted in localStorage later)
const useCustomerStore = create((set) => ({
  customer: JSON.parse(localStorage.getItem('rambazar_customer')) || null,
  setCustomer: (newData) => {
    // Robust Merge: Ensure we don't lose the token if newData is just profile info
    const existing = JSON.parse(localStorage.getItem('rambazar_customer')) || {};
    const merged = { ...existing, ...newData };
    
    // Explicitly keep token if it existed in either
    if (existing.token && !newData.token) {
      merged.token = existing.token;
    }

    localStorage.setItem('rambazar_customer', JSON.stringify(merged));
    set({ customer: merged });
  },
  clearCustomer: () => {
    localStorage.removeItem('rambazar_customer');
    localStorage.removeItem('staff_token');
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('rider_auth');
    set({ customer: null });
  }
}));

export default useCustomerStore;
