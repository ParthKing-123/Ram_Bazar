import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, MapPin, LogOut, Edit2, Check, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { customer, clearCustomer, setCustomer } = useCustomerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    profileImage: customer?.profileImage || ''
  });
  
  const [imageFile, setImageFile] = useState(null);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: () => {
          clearCustomer();
          navigation.replace('Login');
        }
      }
    ]);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow camera roll permissions to upload a photo.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageFile(result.assets[0]);
    }
  };

  const uploadImage = async (file) => {
    const data = new FormData();
    data.append('image', {
      name: 'profile.jpg',
      type: file.mimeType || 'image/jpeg',
      uri: file.uri,
    });
    
    const res = await api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.imageUrl;
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Name and Phone number are required.');
      return;
    }
    
    try {
      setLoading(true);
      
      let finalImageUrl = formData.profileImage;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      
      const payload = {
        ...formData,
        profileImage: finalImageUrl
      };

      const res = await api.put(`/customers/${customer._id}`, payload);
      await setCustomer(res.data); // Update Zustand & SecureStore
      setIsEditing(false);
      setImageFile(null);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      profileImage: customer?.profileImage || ''
    });
    setImageFile(null);
    setIsEditing(false);
  };

  if (!customer) return null;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Premium Header */}
        <View className="bg-white px-6 pt-10 pb-8 border-b border-gray-100 items-center shadow-sm elevation-2 mb-6">
          <View className="w-28 h-28 bg-green-50 rounded-full items-center justify-center mb-5 shadow-sm border border-green-100 relative overflow-hidden">
            {imageFile ? (
               <Image source={{ uri: imageFile.uri }} className="w-full h-full rounded-full" resizeMode="cover" />
            ) : formData.profileImage ? (
               <Image source={{ uri: formData.profileImage.startsWith('http') ? formData.profileImage : `http://10.100.19.61:5000${formData.profileImage}` }} className="w-full h-full rounded-full" resizeMode="cover" />
            ) : (
               <Text className="text-5xl font-black text-green-700">
                 {customer.name?.charAt(0).toUpperCase()}
               </Text>
            )}
            
            {isEditing && (
              <TouchableOpacity onPress={pickImage} className="absolute inset-0 bg-black/40 items-center justify-center rounded-full">
                <Camera size={24} color="#ffffff" />
                <Text className="text-white text-xs font-bold mt-1">Upload</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
             <TextInput 
               value={formData.name}
               onChangeText={text => setFormData({...formData, name: text})}
               className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full text-center"
               placeholder="Your Full Name"
             />
          ) : (
            <>
              <Text className="text-2xl font-black text-gray-900 tracking-tight">{customer.name}</Text>
              <Text className="text-green-600 font-bold mt-1 text-sm bg-green-50 px-3 py-1 rounded-full overflow-hidden">Welcome back!</Text>
            </>
          )}
        </View>

        <View className="px-5 space-y-4">
          <View className="flex-row justify-between items-center px-2 mb-2">
             <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Details</Text>
             {!isEditing ? (
               <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-lg">
                 <Edit2 size={12} color="#4b5563" className="mr-1" />
                 <Text className="text-gray-600 font-bold text-xs">Edit</Text>
               </TouchableOpacity>
             ) : (
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={cancelEdit} className="bg-gray-100 px-3 py-1.5 rounded-lg flex-row items-center">
                    <X size={12} color="#ef4444" className="mr-1" />
                    <Text className="text-red-500 font-bold text-xs">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} disabled={loading} className="bg-green-600 px-3 py-1.5 rounded-lg flex-row items-center">
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Check size={12} color="#fff" className="mr-1" />}
                    <Text className="text-white font-bold text-xs">Save</Text>
                  </TouchableOpacity>
                </View>
             )}
          </View>
          
          {/* Phone Field */}
          <View className="bg-white rounded-[24px] p-5 flex-row items-center shadow-sm border border-gray-100 elevation-1 mb-3">
            <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
              <Phone size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Phone Number</Text>
              {isEditing ? (
                 <TextInput 
                  value={formData.phone}
                  onChangeText={text => setFormData({...formData, phone: text})}
                  keyboardType="phone-pad"
                  className="text-base font-bold text-gray-900 border-b border-gray-200 py-1"
                  placeholder="e.g. 9876543210"
                />
              ) : (
                <Text className="text-lg font-bold text-gray-900">{customer.phone}</Text>
              )}
            </View>
          </View>

          {/* Address Field */}
          <View className="bg-white rounded-[24px] p-5 flex-row items-start shadow-sm border border-gray-100 elevation-1 mb-6">
            <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mr-4">
              <MapPin size={24} color="#9333ea" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Delivery Address</Text>
              {isEditing ? (
                 <TextInput 
                  value={formData.address}
                  onChangeText={text => setFormData({...formData, address: text})}
                  multiline
                  className="text-base font-bold text-gray-900 border-b border-gray-200 py-1"
                  placeholder="Enter your full address"
                />
              ) : (
                <Text className="text-base font-medium text-gray-900">{customer.address || 'Not provided'}</Text>
              )}
            </View>
          </View>

          {/* Rewards Button */}
          {!isEditing && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Rewards')}
              className="bg-green-600 flex-row items-center justify-between py-4 px-5 rounded-[24px] shadow-sm elevation-2 mb-2"
            >
              <View className="flex-row items-center">
                <View className="bg-white/20 p-2 rounded-xl mr-3">
                  <Text className="text-xl">🎁</Text>
                </View>
                <View>
                  <Text className="text-white font-black text-lg">Rewards & Coupons</Text>
                  <Text className="text-green-100 font-medium text-xs">Tap to view your points!</Text>
                </View>
              </View>
              <View className="bg-white/20 p-2 rounded-full">
                <Text className="text-white font-bold text-xs">View</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          {!isEditing && (
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-white flex-row items-center justify-center py-4 rounded-2xl border-2 border-red-50 mt-4 shadow-sm elevation-1"
            >
              <LogOut size={20} color="#dc2626" className="mr-2" />
              <Text className="text-red-600 font-bold text-base">Secure Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
