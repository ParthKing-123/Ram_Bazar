import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

export default function LoginScreen({ navigation }) {
  const { customer, setCustomer } = useCustomerStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      navigation.replace('Home');
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/customers/login', { phone, password });
      const cust = response.data;
      await setCustomer(cust);
      navigation.replace('Home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Network Error. Make sure backend is running!';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  if (customer) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center px-6 py-12">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-green-700 rounded-xl items-center justify-center shadow-sm mb-6">
          <Text className="text-white font-bold text-4xl mt-1">R</Text>
        </View>
        <Text className="text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </Text>
        <Text className="mt-2 text-center text-base text-gray-600">
          Sign in to Padmavati super bazar
        </Text>
      </View>

      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>
          <TextInput 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
            placeholder="9876543210"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
          <TextInput 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          className={`w-full bg-green-600 py-3.5 rounded-xl items-center flex-row justify-center ${loading ? 'opacity-70' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="mt-5 flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-green-700 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 border-t border-gray-100 pt-6 items-center">
          <Text className="text-gray-500 mb-4">Are you an administrator?</Text>
          <TouchableOpacity 
            className="w-full border-2 border-green-600 py-3 rounded-xl items-center"
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text className="text-green-700 text-base font-semibold">Admin Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
