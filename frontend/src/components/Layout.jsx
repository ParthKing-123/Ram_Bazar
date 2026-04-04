import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Home, ClipboardList, Info, Globe, User, LogOut, MapPin, Phone, Mail } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useCustomerStore from '../store/useCustomerStore';
import useSearchStore from '../store/useSearchStore';
import useLanguageStore from '../store/useLanguageStore';
import GroceryChatbot from './GroceryChatbot';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'HI' },
  { code: 'mr', label: 'मराठी', short: 'MR' },
];

const Layout = () => {
  const { cart } = useCartStore();
  const { customer, clearCustomer } = useCustomerStore();
  const { searchTerm, setSearchTerm } = useSearchStore();
  const { lang, setLang, t } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const navItems = [
    { to: '/',       icon: Home,          key: 'home' },
    { to: '/orders', icon: ClipboardList, key: 'orders' },
    { to: '/about',  icon: Info,          key: 'about' },
  ];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-xl tracking-tight text-brand-900">Padmavati super bazar</span>
                <span className="block text-[10px] leading-none text-gray-400 font-medium tracking-wider uppercase">Pethvadgaon</span>
              </div>
            </Link>

            {/* Search Bar – desktop */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (window.location.pathname !== '/') navigate('/');
                  }}
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                  placeholder={t('searchPlaceholder')}
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 md:hidden text-gray-500 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(({ to, key }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                      isActive(to)
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-gray-600 hover:text-brand-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-brand-700 hover:bg-brand-50 transition-colors border border-gray-200 bg-white"
                  aria-label="Change language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">{currentLang.short}</span>
                </button>

                {langMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {LANGUAGES.map(({ code, label, short }) => (
                        <button
                          key={code}
                          onClick={() => { setLang(code); setLangMenuOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                            lang === code
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{label}</span>
                          <span className="text-xs font-bold text-gray-400">{short}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              {customer && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center justify-center w-[38px] h-[38px] rounded-xl bg-white text-gray-600 hover:text-brand-700 hover:bg-brand-50 transition-colors border border-gray-200"
                    aria-label="User Profile"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </button>

                  {profileMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                      {/* Dropdown */}
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-100 rounded-full blur-2xl -mr-10 -mt-10" />
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-inner z-10">
                            {customer.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="z-10">
                            <p className="font-bold text-gray-900 leading-tight">{customer.name}</p>
                            <p className="text-xs text-brand-600 font-bold mt-0.5">Welcome back!</p>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                            <span className="font-medium">{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700">
                              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="truncate font-medium">{customer.email}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-3 px-3 py-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-tight font-medium text-xs">{customer.address}</span>
                          </div>
                        </div>
                        <div className="p-2 border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={() => {
                              clearCustomer();
                              setProfileMenuOpen(false);
                              navigate('/login');
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Cart */}
              <button
                onClick={() => navigate('/checkout')}
                className="relative p-2.5 text-gray-700 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors group"
              >
                <ShoppingBag className="h-5 w-5 group-hover:scale-105 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-600 rounded-full shadow ring-2 ring-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Drawer */}
          {mobileSearchOpen && (
            <div className="pb-3 md:hidden">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (window.location.pathname !== '/') navigate('/');
                  }}
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                  placeholder={t('searchPlaceholder')}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden bg-gray-50/50 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!['/checkout', '/success'].includes(location.pathname) && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-[40]">

        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map(({ to, icon: Icon, key }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all ${active ? 'text-brand-700' : 'text-gray-400'}`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-brand-100' : ''}`}>
                  <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-brand-700' : 'text-gray-400'}`}>
                  {t(key)}
                </span>
              </Link>
            );
          })}

          {/* Cart in bottom nav */}
          <button
            onClick={() => navigate('/checkout')}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all text-gray-400"
          >
            <div className="relative p-1.5 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-0.5 text-[9px] font-bold text-white bg-brand-600 rounded-full ring-1 ring-white">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-wide">{t('cart')}</span>
          </button>

          {/* Profile in bottom nav (Mobile) */}
          {customer && (
            <button
              onClick={() => setProfileMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all text-gray-400"
            >
              <div className="relative p-1.5 rounded-xl">
                <User className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">Profile</span>
            </button>
          )}
        </div>
      </nav>
      )}

      {/* Mobile Profile Drawer/Modal */}
      {customer && profileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProfileMenuOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-[slide-up_0.3s_ease-out]">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner z-10 shrink-0">
                {customer.name?.charAt(0).toUpperCase()}
              </div>
              <div className="z-10">
                <p className="font-bold text-gray-900 text-lg leading-tight">{customer.name}</p>
                <p className="text-sm text-brand-600 font-bold mt-0.5">Welcome back!</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Phone className="w-5 h-5 text-brand-500" />
                </div>
                <span className="font-bold text-gray-700">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-bold text-gray-700 truncate">{customer.email}</span>
                </div>
              )}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <MapPin className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-bold text-gray-700 text-sm leading-tight line-clamp-2">{customer.address}</span>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-100 pb-8">
              <button
                onClick={() => {
                  clearCustomer();
                  setProfileMenuOpen(false);
                  navigate('/onboarding');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
               >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <GroceryChatbot />
    </div>
  );
};

export default Layout;
