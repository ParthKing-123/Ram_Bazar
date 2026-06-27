import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

export default function SignupScreen({ navigation }) {
  const { setCustomer } = useCustomerStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !password || !address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/customers', { name, phone, password, address, referredBy });
      const cust = response.data;
      await setCustomer(cust);
      navigation.replace('Home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Network Error. Make sure backend is running!';
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 24, paddingVertical: 48 }}>
        <View className="items-center mb-8">
          <Text className="text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </Text>
          <Text className="mt-2 text-center text-base text-gray-600">
            Join Padmavati super bazar
          </Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
              placeholder="John Doe"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Phone Number</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
              placeholder="9876543210"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
              placeholder="123 Main St, City"
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={setAddress}
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

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1">Referral Code (Optional)</Text>
            <TextInput 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 uppercase"
              placeholder="e.g. A1B2C3"
              placeholderTextColor="#9ca3af"
              value={referredBy}
              onChangeText={setReferredBy}
              autoCapitalize="characters"
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
              <Text className="text-white text-lg font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-green-700 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
