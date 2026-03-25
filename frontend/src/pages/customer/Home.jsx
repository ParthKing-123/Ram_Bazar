import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Search, ShoppingCart } from 'lucide-react';
import useCustomerStore from '../../store/useCustomerStore';
import useCartStore from '../../store/useCartStore';
import useSearchStore from '../../store/useSearchStore';
import ProductCard from '../../components/ProductCard';
import EventTabView from './EventTabView';
import api from '../../services/api';
import useLanguageStore from '../../store/useLanguageStore';

const CATEGORY_KEYS = [
  { label: 'All', key: 'all' },
  { label: 'Grocery', key: 'grocery' },
  { label: 'Provision', key: 'provision' },
  { label: 'Household', key: 'household' },
  { label: 'Loose Grocery', key: 'looseGrocery' },
  { label: 'Travel Accessories', key: 'travelAccessories' },
];

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const Home = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerStore();
  const { cart, addToCart, updateQuantity } = useCartStore();

  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, sortOrder, setSortOrder } = useSearchStore();
  const { t } = useLanguageStore();

  const activeEvents = events.filter(e => e.isActive && new Date(e.deadline) > new Date());

  useEffect(() => {
    // Redirect to login if not logged in
    if (!customer) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [productsRes, eventsRes] = await Promise.all([
          api.get('/products'),
          api.get('/events')
        ]);
        setProducts(productsRes.data);
        setEvents(eventsRes.data.filter(e => e.isActive));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customer, navigate]);

  let filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  if (sortOrder === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = useCartStore(state => state.getCartTotal());

  if (selectedEvent) {
    return <EventTabView event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
              <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Mobile Search - Visible only on mobile below header */}
      <div className="md:hidden p-4 bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Banner/Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome, {customer?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">What would you like to order today?</p>
        </div>

        {/* Categories & Sorting Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {CATEGORY_KEYS.map(({ label, key }) => (
              <button
                key={label}
                onClick={() => setSelectedCategory(label)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === label ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
              >
                {t(key)}
              </button>
            ))}
          </div>

          <div className="shrink-0 self-end sm:self-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium cursor-pointer"
            >
              <option value="">{t('sortByPrice')}</option>
              <option value="price_asc">{t('priceLowHigh')}</option>
              <option value="price_desc">{t('priceHighLow')}</option>
            </select>
          </div>
        </div>

        {/* Active Events Banners (Clickable) */}
        {activeEvents.length > 0 && searchTerm === '' && selectedCategory === 'All' && (
          <div className="mb-8 flex overflow-x-auto gap-4 hide-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {activeEvents.map(event => (
              <button
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className="relative w-72 sm:w-80 h-36 rounded-3xl overflow-hidden shrink-0 shadow-sm border border-gray-100 group focus:outline-none focus:ring-2 focus:ring-brand-500 ring-offset-2"
              >
                {event.image && (
                  <img src={getImageUrl(event.image)} alt={event.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-black/20 flex flex-col justify-end p-5 text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-md">{event.name}</h3>
                  <span className="text-xs font-semibold text-white/90 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl mt-2 w-max border border-white/20 shadow-sm">
                    {t('exploreFestival')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t('noProductsFound')}</h3>
            <p className="mt-1 text-gray-500">{t('noProductsMsg')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile Only) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50 animate-[slide-up_0.3s_ease-out]">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-700 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-800/50 p-2 rounded-xl">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-tight">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</div>
                <div className="text-xs text-brand-100 opacity-90">₹{cartTotal}</div>
              </div>
            </div>
            <div className="font-bold flex items-center gap-1">
              View Cart <span className="text-xl leading-none ml-1">→</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
