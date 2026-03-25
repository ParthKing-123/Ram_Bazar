import { create } from 'zustand';

const useSearchStore = create((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  sortOrder: '', // 'price_asc' | 'price_desc'
  setSortOrder: (order) => set({ sortOrder: order })
}));

export default useSearchStore;
