import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../../services/api';

const BACKEND_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      // Sort by newest first
      setOrders(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      fetchOrders(); // Refresh list to get updated stock/status if needed
      
      // WhatsApp Automation
      const order = orders.find(o => o._id === orderId);
      if (order && order.customer && order.customer.phone) {
          const customerPhone = order.customer.phone;
          let message = '';
          
          if (newStatus === 'Confirmed') {
              message = `*YOO !! THE ORDER IS CONFIRMEND*\n\nYour order #${order._id.substring(order._id.length - 6).toUpperCase()} has been accepted by Padmavati super bazar.`;
          } else if (newStatus === 'Out for Delivery') {
              message = `*OUT FOR DELIVERY*\n\nYour order #${order._id.substring(order._id.length - 6).toUpperCase()} is on its way to you!`;
          }
          
          if (message) {
              const whatsappUrl = `https://wa.me/91${customerPhone}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
          }
      }
      
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders ({orders.length})</h2>
      </div>

      <div className="space-y-4">
          {orders.length === 0 ? (
               <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                   <p className="text-gray-500">No orders placed yet.</p>
               </div>
          ) : (
             orders.map((order) => (
                 <div key={order._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                         <div>
                             <div className="flex items-center gap-3">
                                 <span className="font-bold text-gray-900">
                                     #{order._id.substring(order._id.length - 6).toUpperCase()}
                                 </span>
                                 <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                     {order.status}
                                 </span>
                             </div>
                             <div className="text-sm text-gray-500 mt-1">
                                 {new Date(order.createdAt).toLocaleString()}
                             </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Customer Info */}
                         <div>
                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h4>
                             <div className="text-sm space-y-1">
                                 <div className="font-medium text-gray-900">{order.customer?.name}</div>
                                 <div className="text-gray-600">{order.customer?.phone}</div>
                                 <div className="text-gray-600">{order.customer?.address}</div>
                             </div>
                         </div>

                           <div>
                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Summary</h4>
                             <ul className="space-y-3 text-sm text-gray-600 max-h-48 overflow-y-auto pr-2">
                                 {order.items.map((item, index) => (
                                     <li key={index} className="flex justify-between items-start">
                                         <div className="flex gap-2 items-center">
                                             <img
                                                 src={getImageUrl(item.image) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=80'}
                                                 alt={item.name}
                                                 className="w-10 h-10 rounded shadow-sm object-cover bg-gray-50 shrink-0"
                                                 onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=80'; }}
                                             />
                                             <div>
                                                 <div className="font-medium text-gray-900 leading-tight"><span className="text-brand-600 text-xs mr-1">{item.quantity}x</span>{item.name}</div>
                                                 <div className="text-xs text-gray-400 mt-0.5">{item.unit || '1 Piece'}</div>
                                             </div>
                                         </div>
                                         <span className="font-medium whitespace-nowrap ml-2">₹{item.price * item.quantity}</span>
                                     </li>
                                 ))}
                             </ul>
                             <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                                 <span className="font-medium text-gray-500">Method: <strong className="text-gray-900">{order.paymentMethod}</strong></span>
                                 <span className="font-bold text-gray-900 text-lg">Total: ₹{order.total}</span>
                             </div>
                         </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                         {order.status === 'Pending' && (
                             <>
                                <button onClick={() => handleStatusChange(order._id, 'Rejected')} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm rounded-xl transition-colors">
                                    Reject Order
                                </button>
                                <button onClick={() => handleStatusChange(order._id, 'Confirmed')} className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 font-medium text-sm rounded-xl shadow-sm transition-colors">
                                    Accept Order
                                </button>
                             </>
                         )}
                         {order.status === 'Confirmed' && (
                             <button onClick={() => handleStatusChange(order._id, 'Out for Delivery')} className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 font-medium text-sm rounded-xl shadow-sm transition-colors">
                                 Mark Out for Delivery
                             </button>
                         )}
                         {order.status === 'Out for Delivery' && (
                             <button onClick={() => handleStatusChange(order._id, 'Delivered')} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium text-sm rounded-xl shadow-sm transition-colors">
                                 ✅ Confirm Payment & Deliver
                             </button>
                         )}
                         {(order.status === 'Delivered' || order.status === 'Rejected') && (
                             <span className="text-sm text-gray-400 font-medium italic">Order closed ({order.status})</span>
                         )}
                     </div>
                     
                     {/* Rating Display */}
                     {order.deliveryRating && (
                         <div className="mt-4 pt-4 border-t border-gray-100 bg-green-50/50 rounded-xl p-3">
                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Feedback</h4>
                             <div className="flex items-center gap-1 mb-1">
                                 {[1, 2, 3, 4, 5].map(star => (
                                     <Star key={star} className={`w-4 h-4 ${star <= order.deliveryRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                 ))}
                                 <span className="text-xs font-bold text-gray-700 ml-2">{order.deliveryRating} / 5</span>
                             </div>
                             {order.deliveryFeedback && (
                                 <p className="text-sm text-gray-700 italic mt-1 bg-white p-2 rounded border border-green-100">"{order.deliveryFeedback}"</p>
                             )}
                         </div>
                     )}
                 </div>
             ))
          )}
      </div>
    </div>
  );
};

export default OrdersTab;
