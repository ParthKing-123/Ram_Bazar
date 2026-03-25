import React from 'react';
import { Plus, Minus } from 'lucide-react';
import useCartStore from '../store/useCartStore';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const ProductCard = ({ product, customClass = '' }) => {
  const { cart, addToCart, updateQuantity } = useCartStore();
  
  const item = cart.find(i => i.product === product._id);
  const quantity = item ? item.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`bg-white rounded-2xl p-3 border border-gray-100 shadow-sm card-hover flex flex-col group relative ${customClass}`}>
        
        {/* Stock Badge Overlay */}
        {isOutOfStock && (
            <div className="absolute top-2 left-2 z-10 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Out of stock
            </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
             <div className="absolute top-2 left-2 z-10 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Only {product.stock} left
            </div>
        )}

        <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-50">
            <img 
                src={getImageUrl(product.image) || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&color=fff&size=300`} 
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&color=fff&size=300`;
                }}
            />
        </div>
        
        <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{product.name}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-brand-700 font-bold text-sm sm:text-base">₹{product.price}</span>
                <span className="text-gray-400 text-xs font-medium">/ {product.unit || '1 Piece'}</span>
            </div>
        </div>

        <div className="mt-4">
            {quantity === 0 ? (
                <button
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`w-full py-2 px-4 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 flex items-center justify-center gap-1
                        ${isOutOfStock 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-95'
                        }`}
                >
                    <Plus className="h-4 w-4" /> Add
                </button>
            ) : (
                <div className="flex items-center justify-between bg-brand-700 text-white rounded-xl overflow-hidden shadow-sm">
                    <button 
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="p-2 hover:bg-brand-800 transition-colors focus:outline-none active:bg-brand-900"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold px-2 w-8 text-center">{quantity}</span>
                    <button 
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-brand-800 transition-colors focus:outline-none disabled:opacity-50 disabled:hover:bg-brand-700 active:bg-brand-900"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default ProductCard;
