import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import ProductCard from '../../components/ProductCard';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const EventTabView = ({ event, onBack }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Scroll to top when opening an event
    window.scrollTo(0, 0);
    
    const calculateTimeLeft = () => {
      const difference = new Date(event.deadline) - new Date();
      if (difference <= 0) return 'Expired';

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [event.deadline]);

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-24 animate-[fade-in_0.3s_ease-out]">
       <div className="relative w-full h-48 sm:h-64 md:h-80 bg-gray-900 border-b border-gray-200 shadow-sm">
           {event.image && (
             <img src={getImageUrl(event.image)} alt={event.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
           )}
           <div className="absolute top-4 left-4 z-10">
               <button onClick={onBack} className="bg-white/10 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white">
                   <ArrowLeft className="w-6 h-6" />
               </button>
           </div>
           
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
               <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4 tracking-tight">{event.name}</h1>
               <div className="bg-white/20 backdrop-blur-lg px-6 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2.5 shadow-xl">
                   <Clock className="w-5 h-5 text-red-100 animate-pulse" />
                   <span className="text-lg font-bold tracking-wide text-white drop-shadow-sm font-mono">
                      {timeLeft === 'Expired' ? 'Event has ended' : `Ends in: ${timeLeft}`}
                   </span>
               </div>
           </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-gray-900">Featured Collections</h2>
             <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{event.products.length} Items</span>
           </div>

           {event.products && event.products.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                 {event.products.map(product => (
                     <ProductCard key={product._id} product={product} />
                 ))}
               </div>
           ) : (
               <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl bg-white shadow-sm">
                  <div className="text-4xl mb-3">🛍️</div>
                  <h3 className="text-lg font-medium text-gray-900">No products available.</h3>
                  <p className="mt-1 text-sm text-gray-500">The admin hasn't curated this event yet.</p>
               </div>
           )}
       </div>
    </div>
  );
};

export default EventTabView;
