import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useCustomerStore = create((set, get) => ({
  customer: null,
  isInitialized: false,

  initCustomer: async () => {
    try {
      const storedData = await SecureStore.getItemAsync('rambazar_customer');
      if (storedData) {
        set({ customer: JSON.parse(storedData), isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (e) {
      console.error("Failed to load customer from storage", e);
      set({ isInitialized: true });
    }
  },

  setCustomer: async (newData) => {
    try {
      const existingStr = await SecureStore.getItemAsync('rambazar_customer');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const merged = { ...existing, ...newData };
      
      if (existing.token && !newData.token) {
        merged.token = existing.token;
      }

      await SecureStore.setItemAsync('rambazar_customer', JSON.stringify(merged));
      set({ customer: merged });
    } catch (e) {
      console.error("Failed to save customer to storage", e);
    }
  },

  clearCustomer: async () => {
    try {
      await SecureStore.deleteItemAsync('rambazar_customer');
      await SecureStore.deleteItemAsync('staff_token');
      await SecureStore.deleteItemAsync('admin_auth');
      await SecureStore.deleteItemAsync('rider_auth');
      set({ customer: null });
    } catch (e) {
      console.error("Failed to clear storage", e);
    }
  }
}));

export default useCustomerStore;
