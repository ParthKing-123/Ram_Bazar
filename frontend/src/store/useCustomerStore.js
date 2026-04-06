import { create } from 'zustand';

// Store for customer details (persisted in localStorage later)
const useCustomerStore = create((set) => ({
  customer: JSON.parse(localStorage.getItem('rambazar_customer')) || null,
  setCustomer: (customerData) => {
    localStorage.setItem('rambazar_customer', JSON.stringify(customerData));
    set({ customer: customerData });
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
