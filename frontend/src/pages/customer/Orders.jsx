import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, FileText, ChevronLeft } from 'lucide-react';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) {
      navigate('/onboarding');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get(`/orders/customer/${customer._id}`);
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer, navigate]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock, label: 'Awaiting Confirmation' };
      case 'Confirmed':
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Package, label: 'Order Confirmed' };
      case 'Delivered':
        return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, label: 'Delivered Successfully' };
      case 'Out for Delivery':
        return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Package, label: 'Out for Delivery' };
      case 'Rejected':
        return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'Order Rejected' };
      default:
        return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: FileText, label: status };
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
              <div className="text-gray-500 animate-pulse font-medium">Loading your orders...</div>
          </div>
      );
  }

  const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Out for Delivery');
  const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Rejected');

  const OrderCard = ({ order }) => {
      const config = getStatusConfig(order.status);
      const StatusIcon = config.icon;

      return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden relative">
              {/* Status Banner */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.bg} opacity-80`}></div>
              
              <div className="flex justify-between items-start mb-4 pt-1">
                  <div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${config.color} ${config.bg} border ${config.border} mb-2`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                          Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="font-bold text-gray-900 mt-1">₹{order.total}</div>
                  </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-sm mt-2">
                  {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-gray-600">
                          <span className="flex gap-2">
                              <span className="font-medium text-gray-900">{item.quantity}x</span> 
                              <span>{item.name}</span>
                          </span>
                      </div>
                  ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>Method: {order.paymentMethod}</span>
                  {order.paymentMethod === 'COD' && order.status === 'Pending' && (
                      <span className="text-brand-600">Payment to be collected</span>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
            <button 
                onClick={() => navigate('/')}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="ml-2 font-bold text-lg text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {orders.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">Looks like you haven't placed any orders. Start shopping for fresh groceries now!</p>
                  <button onClick={() => navigate('/')} className="btn-primary inline-flex">
                      Start Shopping
                  </button>
              </div>
          ) : (
              <>
                  {/* Active Orders Section */}
                  {activeOrders.length > 0 && (
                      <section>
                          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                              Live Tracking <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">{activeOrders.length}</span>
                          </h2>
                          <div className="space-y-4">
                              {activeOrders.map(order => <OrderCard key={order._id} order={order} />)}
                          </div>
                      </section>
                  )}

                  {/* Past Orders Section */}
                  {pastOrders.length > 0 && (
                      <section>
                          <h2 className="text-base font-bold text-gray-900 mb-4 mt-8">Past Orders</h2>
                          <div className="space-y-4">
                              {pastOrders.map(order => <OrderCard key={order._id} order={order} />)}
                          </div>
                      </section>
                  )}
              </>
          )}
      </div>
    </div>
  );
};

export default Orders;
