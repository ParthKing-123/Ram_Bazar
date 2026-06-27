import { create } from 'zustand';

const useLanguageStore = create((set, get) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  t: (key) => key // Placeholder for translations
}));

export default useLanguageStore;
