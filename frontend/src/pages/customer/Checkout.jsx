import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, MapPin, Phone, User, Tag, X, Truck, Gift } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 30;

// ─── Coupon Definitions ─────────────────────────────────────────────────────
const COUPONS = {
  WELCOME10: {
    type: 'percent',
    value: 10,
    label: '10% off on your order',
    minCart: 0,
  },
  SAVE20: {
    type: 'flat',
    value: 20,
    label: '₹20 flat off',
    minCart: 0,
  },
  FRESH50: {
    type: 'flat',
    value: 50,
    label: '₹50 off on orders above ₹300',
    minCart: 300,
  },
};

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const calcDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return Math.round((subtotal * coupon.value) / 100);
  return coupon.value;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const { customer, setCustomer } = useCustomerStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(customer || { name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, ...couponDef }
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  useEffect(() => {
    if (!customer) navigate('/onboarding');
    if (cart.length === 0) navigate('/');
  }, [customer, cart.length, navigate]);

  const subtotal = getCartTotal();
  const discount = calcDiscount(appliedCoupon, subtotal);
  const discountedSubtotal = subtotal - discount;
  const deliveryFee = discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const finalTotal = discountedSubtotal + deliveryFee;
  const amountToFreeDelivery = FREE_DELIVERY_THRESHOLD - discountedSubtotal;

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();
    const coupon = COUPONS[code];
    if (!coupon) {
      setCouponError('Invalid coupon code. Try WELCOME10, SAVE20 or FRESH50.');
      return;
    }
    if (subtotal < coupon.minCart) {
      setCouponError(`This coupon requires a minimum cart of ₹${coupon.minCart}.`);
      return;
    }
    setAppliedCoupon({ code, ...coupon });
    setCouponSuccess(`🎉 Coupon "${code}" applied! ${coupon.label}`);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setCustomer({ ...customer, ...editForm });
    setIsEditing(false);
  };

  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderData = {
        customerId: customer._id,
        items: cart,
        total: finalTotal,
        paymentMethod,
        coupon: appliedCoupon ? appliedCoupon.code : null,
        discount,
      };

      const response = await api.post('/orders', orderData);
      clearCart();

      if (paymentMethod === 'COD') {
        const adminPhone = '919028535600';
        const itemList = cart.map(item => `${item.quantity}x ${item.name} (${item.unit || '1 Piece'})`).join(', ');
        const couponLine = appliedCoupon ? `\nCoupon: ${appliedCoupon.code} (−₹${discount})` : '';
        const message = `Hi Padmavati super bazar, I have placed an order!\n\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\nItems: ${itemList}${couponLine}\n\nTotal: ₹${finalTotal}\nPayment Method: Cash on Delivery\n\nPlease confirm my order.`;
        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }

      navigate('/success', { state: { orderId: response.data._id, total: finalTotal } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
      setLoading(false);
    }
  };

  if (!customer || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="ml-2 font-bold text-lg text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">{error}</div>
        )}

        {/* Free Delivery Banner */}
        {amountToFreeDelivery > 0 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Truck className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              Add <span className="font-bold">₹{amountToFreeDelivery}</span> more for <span className="font-bold text-green-700">FREE delivery!</span>
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <Truck className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-semibold">🎉 You've unlocked FREE delivery!</p>
          </div>
        )}

        {/* Customer Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" /> Delivery Details
            </h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-sm text-brand-700 font-medium hover:underline">Edit</button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input type="text" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input type="tel" required value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <textarea required rows="2" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-brand-700 text-white rounded-xl py-2 text-sm font-medium">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2 text-sm font-medium">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-900 font-medium text-sm">{customer.name}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm leading-relaxed">{customer.address}</span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId || item.product} className="flex gap-4 items-center">
                <img
                  src={getImageUrl(item.image) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=80'}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=80'; }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                  <div className="text-brand-700 font-bold text-sm mt-1">
                      ₹{item.price} <span className="text-gray-400 font-normal text-xs">/ {item.unit || '1 Piece'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.cartItemId || item.product, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors">
                      {item.quantity === 1 ? <Trash2 className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-gray-600" />}
                    </button>
                    <span className="font-semibold text-sm px-2 w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId || item.product, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors">
                      <Plus className="h-4 w-4 text-brand-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" /> Coupons & Offers
          </h2>

          {/* Available coupons hint */}
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(COUPONS).map(([code, c]) => (
              <button
                key={code}
                onClick={() => { setCouponInput(code); setCouponError(''); setCouponSuccess(''); }}
                className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-xl font-semibold hover:bg-purple-100 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-3">Tap a code above or type your coupon below</p>

          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-800">{appliedCoupon.code}</span>
                <span className="text-xs text-green-700">· −₹{discount}</span>
              </div>
              <button onClick={handleRemoveCoupon} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-800 transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
          {couponSuccess && !appliedCoupon === false && <p className="text-xs text-green-600 mt-2">{couponSuccess}</p>}
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Payment Options</h2>
          <div className="space-y-3">
            <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'UPI' ? 'border-brand-600 bg-brand-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex items-center h-5">
                <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-brand-600 focus:ring-brand-600 border-gray-300" />
              </div>
              <div className="ml-3 text-sm flex-1">
                <span className="font-medium text-gray-900 block">Pay Now (UPI)</span>
                <span className="text-gray-500 text-xs block mt-0.5">Instant confirmation via Google Pay, PhonePe, etc.</span>
              </div>
            </label>

            {paymentMethod === 'UPI' && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="Scan to Pay" className="w-32 h-32 rounded-lg mix-blend-multiply" />
                <p className="text-xs text-gray-500 mt-2 font-medium">Scan to pay exactly ₹{finalTotal}</p>
              </div>
            )}

            <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-brand-600 bg-brand-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex items-center h-5">
                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-brand-600 focus:ring-brand-600 border-gray-300" />
              </div>
              <div className="ml-3 text-sm flex-1">
                <span className="font-medium text-gray-900 block">Cash on Delivery (WhatsApp)</span>
                <span className="text-gray-500 text-xs block mt-0.5">Pay at your doorstep. Subject to confirmation on WhatsApp.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Bill Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Coupon ({appliedCoupon?.code})
                </span>
                <span>−₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-green-600 font-medium tracking-wide">FREE</span>
              ) : (
                <span>₹{deliveryFee}</span>
              )}
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-gray-400">Add ₹{amountToFreeDelivery} more to get free delivery</p>
            )}
            <div className="h-px bg-gray-100 my-1" />
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Grand Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">To Pay</div>
            <div className="font-bold text-xl text-gray-900">₹{finalTotal}</div>
            {discount > 0 && <div className="text-xs text-green-600 font-medium">Saved ₹{discount}</div>}
          </div>
          <button
            onClick={placeOrder}
            disabled={loading}
            className="btn-primary flex-1 max-w-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Ordering...' : 'Place Order via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
