import { create } from 'zustand';
import translations from '../i18n/translations';

const getSavedLang = () => {
  try { return localStorage.getItem('rambazar_lang') || 'en'; }
  catch { return 'en'; }
};

const useLanguageStore = create((set, get) => ({
  lang: getSavedLang(),
  setLang: (lang) => {
    try { localStorage.setItem('rambazar_lang', lang); } catch {}
    set({ lang });
  },
  t: (key) => {
    const { lang } = get();
    return translations[lang]?.[key] || translations['en'][key] || key;
  },
}));

export default useLanguageStore;
