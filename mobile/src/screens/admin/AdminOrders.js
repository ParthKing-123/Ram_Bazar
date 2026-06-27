import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      fetchOrders();
      Alert.alert('Status Updated', `Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrder = ({ item }) => {
    return (
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100 elevation-1">
        <View className="flex-row justify-between mb-3 border-b border-gray-100 pb-3">
          <View>
            <Text className="font-black text-gray-900 text-lg">#{item._id.substring(item._id.length - 6).toUpperCase()}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full self-start ${
            item.status === 'Pending' ? 'bg-yellow-100' :
            item.status === 'Confirmed' ? 'bg-blue-100' :
            item.status === 'Out for Delivery' ? 'bg-purple-100' :
            item.status === 'Delivered' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs font-bold ${
              item.status === 'Pending' ? 'text-yellow-800' :
              item.status === 'Confirmed' ? 'text-blue-800' :
              item.status === 'Out for Delivery' ? 'text-purple-800' :
              item.status === 'Delivered' ? 'text-green-800' : 'text-red-800'
            }`}>{item.status || 'Pending'}</Text>
          </View>
        </View>

        <View className="mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</Text>
          <Text className="text-gray-900 font-bold">{item.customer?.name}</Text>
          <Text className="text-gray-600 text-sm mt-0.5">{item.customer?.phone}</Text>
          <Text className="text-gray-500 text-xs mt-1">{item.customer?.address}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Items</Text>
          {item.items.map((cartItem, idx) => (
            <View key={idx} className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>
                <Text className="font-bold text-green-700">{cartItem.quantity}x</Text> {cartItem.name}
              </Text>
              <Text className="text-gray-900 font-medium text-sm">₹{cartItem.price * cartItem.quantity}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row justify-between border-t border-gray-100 pt-3 mt-1 items-center">
          <Text className="text-gray-500 text-xs font-medium">Method: <Text className="text-gray-900">{item.paymentMethod}</Text></Text>
          <Text className="font-black text-gray-900 text-lg">Total: ₹{item.total}</Text>
        </View>

        {/* Action Buttons */}
        <View className="mt-4 flex-row gap-2">
          {item.status === 'Pending' && (
            <>
              <TouchableOpacity 
                onPress={() => handleStatusChange(item._id, 'Rejected')} 
                className="flex-1 bg-white border border-red-200 py-3 rounded-xl items-center shadow-sm"
              >
                <Text className="text-red-600 font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleStatusChange(item._id, 'Confirmed')} 
                className="flex-1 bg-green-600 py-3 rounded-xl items-center shadow-sm elevation-1"
              >
                <Text className="text-white font-bold">Accept Order</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'Confirmed' && (
            <TouchableOpacity 
              onPress={() => handleStatusChange(item._id, 'Out for Delivery')} 
              className="flex-1 bg-purple-600 py-3 rounded-xl items-center shadow-sm elevation-1"
            >
              <Text className="text-white font-bold">Mark Out for Delivery</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <FlatList 
      data={orders}
      keyExtractor={item => item._id}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      renderItem={renderOrder}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View className="py-20 items-center">
          <Text className="text-gray-500 font-medium">No orders found.</Text>
        </View>
      }
    />
  );
}
