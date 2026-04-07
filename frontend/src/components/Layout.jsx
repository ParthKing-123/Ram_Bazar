import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Home, ClipboardList, Info, Globe, User, LogOut, MapPin, Phone, Mail } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useCustomerStore from '../store/useCustomerStore';
import useSearchStore from '../store/useSearchStore';
import useLanguageStore from '../store/useLanguageStore';
import GroceryChatbot from './GroceryChatbot';
import api from '../services/api';

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

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', address: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navItems = [
    { to: '/',       icon: Home,          key: 'home' },
    { to: '/orders', icon: ClipboardList, key: 'orders' },
    { to: '/about',  icon: Info,          key: 'about' },
  ];

  // Profile Update Handlers
  const openEditProfile = () => {
    // Session Health Pre-Check
    const storageKey = Object.keys(localStorage).find(k => k.toLowerCase() === 'rambazar_customer');
    const storedData = storageKey ? localStorage.getItem(storageKey) : null;
    const hasToken = storedData ? JSON.parse(storedData)?.token : false;

    if (!hasToken) {
      setUpdateError('Your session has expired. Please sign out and sign in again.');
    }

    setEditFormData({
      name: customer?.name || '',
      email: customer?.email || '',
      address: customer?.address || '',
    });
    // Don't clear error if it was a session error
    if (hasToken) setUpdateError('');
    setIsEditProfileOpen(true);
    setProfileMenuOpen(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError('');

    try {
      const res = await api.put(`/customers/${customer._id}`, editFormData);
      // Explicitly merge to ensure token (which is in `customer`) is preserved if res.data is partial
      useCustomerStore.getState().setCustomer({ ...customer, ...res.data });
      setIsEditProfileOpen(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

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
                          <button
                            onClick={openEditProfile}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 rounded-xl transition-colors text-left"
                          >
                            <User className="w-4 h-4" /> Edit Profile
                          </button>
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 opacity-60">
                            <Phone className="w-4 h-4 shrink-0" />
                            <span className="font-medium">{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 opacity-60">
                               <Mail className="w-4 h-4 shrink-0" />
                               <span className="truncate font-medium">{customer.email}</span>
                            </div>
                          )}
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
              <button
                onClick={openEditProfile}
                className="w-full flex items-center gap-4 bg-brand-50 p-4 rounded-2xl border border-brand-100 active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <User className="w-5 h-5 text-brand-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-brand-900">Edit Profile</p>
                  <p className="text-xs text-brand-600 font-medium opacity-70">Update your name or address</p>
                </div>
              </button>

              <div className="flex items-center gap-4 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 opacity-60">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <span className="font-bold text-gray-500">{customer.phone}</span>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-100 pb-8 flex gap-3">
              <button
                onClick={() => {
                  clearCustomer();
                  setProfileMenuOpen(false);
                  navigate('/onboarding');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
               >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <GroceryChatbot />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsEditProfileOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-[modal-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="p-8 pb-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Edit Profile</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Keep your details up to date</p>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <Search className="w-6 h-6 text-gray-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-8 pt-6 space-y-5">
              {updateError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {updateError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold text-gray-800 transition-all text-sm"
                    placeholder="Ram Kumar"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email <span className="text-gray-300 font-bold capitalize">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold text-gray-800 transition-all text-sm"
                    placeholder="yourname@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-[1.125rem] w-4 h-4 text-gray-400" />
                  <textarea
                    required
                    rows="3"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold text-gray-800 transition-all text-sm resize-none leading-relaxed"
                    placeholder="House number, Street name, Landmark"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-4 bg-brand-700 text-white font-black rounded-2xl shadow-xl shadow-brand-200 hover:bg-brand-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-pop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};


export default Layout;
