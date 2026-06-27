import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';

export default function AdminLogin({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/staff/login', { username, password });
      
      if (response.data.role === 'Admin') {
        await SecureStore.setItemAsync('admin_auth', 'true');
        await SecureStore.setItemAsync('staff_token', response.data.token);
        
        // We set the token in the API defaults immediately for admin calls
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        navigation.replace('AdminDashboard');
      } else {
        Alert.alert('Access Denied', 'Not an Admin.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-16 h-16 bg-gray-900 rounded-xl items-center justify-center shadow-sm mb-6">
          <Text className="text-white font-bold text-4xl mt-1">R</Text>
        </View>
        <Text className="text-3xl font-extrabold text-gray-900">Admin Portal</Text>
      </View>
      
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
          <TextInput 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
            placeholder="admin"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
          className={`w-full bg-gray-900 py-3.5 rounded-xl flex-row justify-center items-center ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-6 items-center"
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-green-600 font-medium text-sm">Back to Customer Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
