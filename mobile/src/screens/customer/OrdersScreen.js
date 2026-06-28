import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import useCustomerStore from '../../store/useCustomerStore';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';

export default function OrdersScreen({ navigation }) {
  const { customer } = useCustomerStore();
  const { isDarkMode } = useThemeStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      fetchOrders();
    }
  }, [customer]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/customer/${customer._id}`);
      // Sort by newest first
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock, label: 'Awaiting Confirmation' };
      case 'Confirmed':
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Package, label: 'Order Confirmed' };
      case 'Delivered':
        return { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, label: 'Delivered' };
      case 'Out for Delivery':
        return { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Package, label: 'Out for Delivery' };
      case 'Rejected':
        return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'Rejected' };
      default:
        return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: Package, label: status };
    }
  };

  const renderOrderItem = ({ item: order }) => {
    const config = getStatusConfig(order.status);
    const StatusIcon = config.icon;

    return (
      <View className={`rounded-2xl p-4 mb-4 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <View className={`flex-row items-center px-2 py-1 rounded-lg border ${config.bg} ${config.border} mb-1 self-start`}>
              <StatusIcon size={14} color={config.color.replace('text-', '')} className={config.color} />
              <Text className={`text-xs font-bold ml-1 ${config.color}`}>{config.label}</Text>
            </View>
            <Text className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order #{order._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View className="items-end">
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(order.createdAt).toLocaleDateString()}</Text>
            <Text className={`font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{order.total}</Text>
          </View>
        </View>

        <View className={`border-t pt-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          {order.items.map((item, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View className="flex-1">
                <Text className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>{item.name}</Text>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.quantity} x {item.unit || '1 pc'}</Text>
              </View>
              <Text className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        <View className={`mt-2 pt-2 border-t flex-row justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
          <Text className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Method: {order.paymentMethod}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color="#15803d" />
        <Text className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <View className={`px-4 pt-4 pb-2 border-b ${isDarkMode ? 'bg-slate-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Orders</Text>
      </View>
      
      {orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Package size={48} color="#9ca3af" />
          <Text className={`text-lg font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No orders yet</Text>
          <Text className={`text-center mt-2 mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Looks like you haven't placed any orders. Start shopping for fresh groceries now!</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            className="bg-green-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchOrders}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}
