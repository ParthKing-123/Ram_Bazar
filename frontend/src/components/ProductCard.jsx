import React, { useState } from 'react';
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
  
  const hasVariants = product.variants && product.variants.length > 0;
  const initialUnit = hasVariants ? product.variants[0].unit : (product.unit || '1 Piece');
  const [selectedUnit, setSelectedUnit] = useState(initialUnit);
  
  const currentVariant = hasVariants ? product.variants.find(v => v.unit === selectedUnit) || product.variants[0] : { price: product.price, stock: product.stock, unit: product.unit || '1 Piece' };
  const cartItemId = `${product._id}_${currentVariant.unit}`;
  
  const item = cart.find(i => i.cartItemId === cartItemId || (i.product === product._id && (!i.cartItemId || i.unit === currentVariant.unit)));
  const quantity = item ? item.quantity : 0;
  const isOutOfStock = currentVariant.stock <= 0;

  return (
    <div className={`bg-white rounded-2xl p-3 border border-gray-100 shadow-sm card-hover flex flex-col group relative ${customClass}`}>
        
        {/* Stock Badge Overlay */}
        {isOutOfStock && (
            <div className="absolute top-2 left-2 z-10 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Out of stock
            </div>
        )}
        {currentVariant.stock > 0 && currentVariant.stock <= 5 && (
             <div className="absolute top-2 left-2 z-10 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Only {currentVariant.stock} left
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
            <div className="flex items-center gap-1 mt-1">
                <span className="text-brand-700 font-bold text-sm sm:text-base">₹{currentVariant.price}</span>
                {hasVariants ? (
                  <select 
                     value={selectedUnit} 
                     onChange={(e) => setSelectedUnit(e.target.value)}
                     className="ml-auto text-xs font-medium bg-gray-50 border border-gray-200 rounded p-1 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                     {product.variants.map((v) => <option key={v.unit} value={v.unit}>{v.unit}</option>)}
                  </select>
                ) : (
                  <span className="text-gray-400 text-xs font-medium ml-1">/ {product.unit || '1 Piece'}</span>
                )}
            </div>
        </div>

        <div className="mt-4">
            {quantity === 0 ? (
                <button
                    onClick={() => addToCart(product, currentVariant)}
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
                        onClick={() => updateQuantity(item?.cartItemId || cartItemId, quantity - 1)}
                        className="p-2 hover:bg-brand-800 transition-colors focus:outline-none active:bg-brand-900"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold px-2 w-8 text-center">{quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item?.cartItemId || cartItemId, quantity + 1)}
                        disabled={quantity >= currentVariant.stock}
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
