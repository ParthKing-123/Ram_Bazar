import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, User, CheckCircle2, XCircle, ChevronRight, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const BACKEND_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
};

const RiderDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // { orderId, type: 'deliver' | 'reject' }
    const [paymentSelection, setPaymentSelection] = useState(null); // 'Online' or 'Offline'

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            // strictly filter only orders marked 'Out for Delivery'
            const activeOrders = response.data.filter(
                o => o.status === 'Out for Delivery'
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first for delivery queue
            setOrders(activeOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const performUpdate = async (orderId, newStatus, newPaymentMethod = null) => {
        try {
            const payload = { status: newStatus };
            if (newPaymentMethod) payload.paymentMethod = newPaymentMethod;
            
            await api.put(`/orders/${orderId}`, payload);
            setActiveModal(null);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update status');
        }
    };

    const handleDeliver = (orderId) => {
        if (!paymentSelection) {
            alert('Please select a payment collection method');
            return;
        }
        performUpdate(orderId, 'Delivered', paymentSelection);
    };

    const orderToProcess = orders.find(o => o._id === activeModal?.orderId);

    if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading active deliveries...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm mt-10">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <Truck className="w-8 h-8 text-gray-300" />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900 mb-1">Queue is empty</h2>
                 <p className="text-gray-500 text-sm text-center">No active deliveries assigned right now. Check back later!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Deliveries ({orders.length})</h2>
                <p className="text-sm text-gray-500">Orders ready to be delivered.</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-brand-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                        {/* Status Label */}
                        <div className="absolute top-0 right-0 bg-brand-100 text-brand-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                            {order.status === 'Confirmed' ? 'Ready to pick' : 'En Route'}
                        </div>

                        <div className="flex justify-between items-start mb-4 pt-1">
                            <div>
                                <span className="font-black text-lg text-gray-900">
                                    #{order._id.substring(order._id.length - 6).toUpperCase()}
                                </span>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    Customer Preference: <strong className="text-gray-600">{order.paymentMethod}</strong>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">To Collect</div>
                                <div className="font-bold text-xl text-gray-900">₹{order.total}</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3 border border-gray-100">
                             <div className="flex items-start gap-3">
                                 <User className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                 <span className="text-sm font-semibold text-gray-900">{order.customer?.name}</span>
                             </div>
                             <div className="flex items-start gap-3">
                                 <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                 <a href={`tel:${order.customer?.phone}`} className="text-sm text-brand-700 font-medium hover:underline">{order.customer?.phone}</a>
                             </div>
                             <div className="flex items-start gap-3">
                                 <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                 <span className="text-sm text-gray-700 leading-relaxed">{order.customer?.address}</span>
                             </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items to Deliver</h3>
                             <ul className="space-y-3">
                                 {order.items.map((item, idx) => (
                                     <li key={idx} className="flex justify-between items-start text-sm">
                                         <div className="flex gap-2">
                                             <img
                                                 src={getImageUrl(item.image) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=80'}
                                                 alt={item.name}
                                                 className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                 onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=80'; }}
                                             />
                                             <div>
                                                 <span className="font-semibold text-brand-600 block">{item.quantity}x <span className="font-medium text-gray-900">{item.name}</span></span>
                                                 <span className="text-xs text-gray-400">{item.unit || '1 Piece'}</span>
                                             </div>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                        </div>

                        <div className="flex gap-2">
                             <button
                                 onClick={() => { setActiveModal({ orderId: order._id, type: 'reject' }); }}
                                 className="flex items-center justify-center p-3 sm:px-4 sm:py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                                 title="Mark Failed"
                             >
                                 <XCircle className="w-5 h-5 sm:mr-1" />
                                 <span className="hidden sm:inline">Failed</span>
                             </button>
                             <button
                                 onClick={() => { 
                                     setPaymentSelection(null); 
                                     setActiveModal({ orderId: order._id, type: 'deliver' }); 
                                 }}
                                 className="flex-1 flex items-center justify-center gap-2 bg-brand-700 text-white border border-brand-800 rounded-xl py-3 font-bold text-sm tracking-wide shadow-sm hover:bg-brand-800 transition-all"
                             >
                                 Complete Delivery <ChevronRight className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            {activeModal?.type === 'reject' && orderToProcess && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl relative">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                             <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">Delivery Failed?</h2>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to mark this incoming delivery as Failed / Rejected? (Customer unavailable, etc.)</p>
                        
                        <button
                            onClick={() => performUpdate(orderToProcess._id, 'Rejected')}
                            className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-red-700 transition"
                        >
                            Yes, Mark Failed
                        </button>
                    </div>
                </div>
            )}

            {/* Deliver & Payment Modal */}
            {activeModal?.type === 'deliver' && orderToProcess && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
                    <div className="bg-white rounded-3xl sm:rounded-3xl w-full max-w-md p-6 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto pb-8">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"><X className="w-5 h-5" /></button>
                        
                        <div className="text-center mb-6 mt-2">
                             <h2 className="text-xl font-black text-gray-900 mb-1">Finalize Delivery</h2>
                             <p className="text-sm text-gray-500">Collect <strong className="text-gray-900 font-bold text-base">₹{orderToProcess.total}</strong> from the customer</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-colors ${paymentSelection === 'Online' ? 'border-brand-600 bg-brand-50/50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                <div className="flex items-center h-5">
                                    <input type="radio" name="paymentSelection" value="Online" checked={paymentSelection === 'Online'} onChange={e => setPaymentSelection(e.target.value)} className="w-4 h-4 text-brand-600 focus:ring-brand-600 border-gray-300" />
                                </div>
                                <div className="ml-3 text-sm flex-1">
                                    <span className="font-bold text-gray-900 block">Online (QR Code)</span>
                                    <span className="text-gray-500 text-xs block mt-0.5">Let customer scan UPI code</span>
                                </div>
                            </label>

                            {paymentSelection === 'Online' && (
                                <div className="bg-white border-2 border-brand-100 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                                     <img src="/qr.jpeg" alt="Store UPI QR" className="w-48 h-auto mix-blend-multiply" />
                                     <p className="text-xs font-medium text-gray-500 mt-3 text-center">Ask customer to scan to pay <br/><span className="font-black text-gray-900 text-lg">₹{orderToProcess.total}</span></p>
                                </div>
                            )}

                             <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-colors ${paymentSelection === 'Offline' ? 'border-brand-600 bg-brand-50/50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                <div className="flex items-center h-5">
                                    <input type="radio" name="paymentSelection" value="Offline" checked={paymentSelection === 'Offline'} onChange={e => setPaymentSelection(e.target.value)} className="w-4 h-4 text-brand-600 focus:ring-brand-600 border-gray-300" />
                                </div>
                                <div className="ml-3 text-sm flex-1">
                                    <span className="font-bold text-gray-900 block">Cash Collected</span>
                                    <span className="text-gray-500 text-xs block mt-0.5">Customer gave physical cash</span>
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={() => handleDeliver(orderToProcess._id)}
                            disabled={!paymentSelection}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${!paymentSelection ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-700 text-white hover:bg-brand-800'}`}
                        >
                            <CheckCircle2 className="w-5 h-5" /> 
                            {paymentSelection ? 'Mark Delivered & Paid' : 'Select Payment Method'}
                        </button>
                    </div>
                 </div>
            )}

        </div>
    );
};

export default RiderDashboard;
