import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminEvents from './AdminEvents';

export default function AdminDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await SecureStore.getItemAsync('admin_auth');
    if (!auth) {
      navigation.replace('AdminLogin');
    } else {
      setIsAuth(true);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('admin_auth');
    navigation.replace('Login');
  };

  if (!isAuth) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6 pb-4 flex-row justify-between items-center border-b border-gray-200 bg-white shadow-sm elevation-1 z-10">
        <View>
          <Text className="text-2xl font-black text-gray-900 tracking-tight">Admin Panel</Text>
          <Text className="text-green-600 font-bold text-xs uppercase tracking-wider">Store Management</Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
          <Text className="text-red-600 font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row p-3 gap-2 bg-white border-b border-gray-100 shadow-sm elevation-1 z-0">
        <TouchableOpacity 
          className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'orders' ? 'bg-green-600' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('orders')}
        >
          <Text className={`font-bold text-sm ${activeTab === 'orders' ? 'text-white' : 'text-gray-700'}`}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'products' ? 'bg-green-600' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('products')}
        >
          <Text className={`font-bold text-sm ${activeTab === 'products' ? 'text-white' : 'text-gray-700'}`}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'events' ? 'bg-green-600' : 'bg-gray-100'}`}
          onPress={() => setActiveTab('events')}
        >
          <Text className={`font-bold text-sm ${activeTab === 'events' ? 'text-white' : 'text-gray-700'}`}>Events</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-gray-50">
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'events' && <AdminEvents />}
      </View>
    </SafeAreaView>
  );
}
