import { create } from 'zustand';

const translations = {
  en: {
    home: 'Home',
    orders: 'Orders',
    profile: 'Profile',
    about: 'About',
    search_placeholder: 'Search products...',
    all_categories: 'All Categories',
    add: 'Add',
    logout: 'Logout',
    dark_mode: 'Dark Mode',
    language: 'Language',
    my_rewards: 'My Rewards',
    claim: 'Claim',
    welcome: 'Welcome',
    recent_orders: 'Recent Orders',
    total: 'Total',
    status: 'Status',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    orders: 'ऑर्डर्स',
    profile: 'प्रोफाइल',
    about: 'बद्दल',
    search_placeholder: 'उत्पादने शोधा...',
    all_categories: 'सर्व श्रेणी',
    add: 'जोडा',
    logout: 'लॉगआउट',
    dark_mode: 'डार्क मोड',
    language: 'भाषा',
    my_rewards: 'माझे बक्षिसे',
    claim: 'दावा करा',
    welcome: 'स्वागत आहे',
    recent_orders: 'अलीकडील ऑर्डर्स',
    total: 'एकूण',
    status: 'स्थिती',
  }
};

const useLanguageStore = create((set, get) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  t: (key) => {
    const { lang } = get();
    return translations[lang][key] || key;
  }
}));

export default useLanguageStore;
