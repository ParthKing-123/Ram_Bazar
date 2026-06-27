import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, Image, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, CheckCircle, Calendar } from 'lucide-react-native';
import api from '../../services/api';

const UNITS = ['1 Piece', '1 kg', '500 g', '250 g', '1 L', '500 ml', '1 Dozen', '1 Pack'];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    deadline: '',
    isActive: true,
    image: '',
    products: []
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // For adding a new product inside the event
  const [newProduct, setNewProduct] = useState({ name: '', price: '', unit: '1 Piece', stock: '100' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        deadline: event.deadline ? new Date(event.deadline).toISOString().split('T')[0] : '', // simple YYYY-MM-DD
        isActive: event.isActive,
        image: event.image || '',
        products: event.products || []
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: '',
        deadline: '',
        isActive: true,
        image: '',
        products: []
      });
    }
    setImageFile(null);
    setNewProduct({ name: '', price: '', unit: '1 Piece', stock: '100' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageFile(result.assets[0]);
    }
  };

  const uploadImage = async (file) => {
    const data = new FormData();
    data.append('image', {
      name: 'event_bg.jpg',
      type: file.mimeType || 'image/jpeg',
      uri: file.uri,
    });
    
    const res = await api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.imageUrl;
  };

  const addEventProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert('Validation Error', 'Please enter a product name and price.');
      return;
    }
    const productToAdd = {
      name: newProduct.name,
      price: Number(newProduct.price),
      unit: newProduct.unit,
      stock: Number(newProduct.stock),
      image: '' // we skip per-product image upload on events to save space on mobile UI
    };
    setFormData(prev => ({ ...prev, products: [...prev.products, productToAdd] }));
    setNewProduct({ name: '', price: '', unit: '1 Piece', stock: '100' });
  };

  const removeEventProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, products: updatedProducts }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Event Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const payload = {
        ...formData,
        image: finalImageUrl,
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      
      fetchEvents();
      closeModal();
      Alert.alert('Success', `Event ${editingEvent ? 'updated' : 'published'}!`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      await api.put(`/events/${item._id}`, { isActive: !item.isActive });
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/events/${id}`);
            fetchEvents();
          } catch (error) {
            console.error(error);
          }
      }}
    ]);
  };

  const renderEvent = ({ item }) => (
    <View className="bg-white rounded-3xl overflow-hidden shadow-sm mb-5 border border-gray-100 elevation-2">
      <View className="h-32 bg-gray-200 w-full relative">
        {item.image && (
          <Image source={{ uri: item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}` }} className="w-full h-full" resizeMode="cover" />
        )}
        <View className="absolute inset-0 bg-black/40 p-4 justify-between">
          <View className="flex-row justify-between items-start">
             <View className={`px-2 py-1 rounded-full flex-row items-center ${item.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                <Text className="text-white text-xs font-bold">{item.isActive ? 'Active' : 'Inactive'}</Text>
             </View>
             <Switch 
                value={item.isActive} 
                onValueChange={() => toggleStatus(item)} 
                trackColor={{ false: '#9ca3af', true: '#22c55e' }}
                thumbColor="#ffffff"
             />
          </View>
          <Text className="text-white text-2xl font-black">{item.name}</Text>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row items-center mb-3">
           <Calendar size={14} color="#6b7280" className="mr-1" />
           <Text className="text-gray-500 text-xs font-medium">Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
        </View>

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Products ({item.products.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
           {item.products.map((p, idx) => (
             <View key={idx} className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl mr-2">
               <Text className="text-gray-800 font-bold text-xs">{p.name}</Text>
             </View>
           ))}
           {item.products.length === 0 && <Text className="text-gray-400 text-xs italic">No products added</Text>}
        </ScrollView>

        <View className="flex-row gap-2 border-t border-gray-100 pt-4">
          <TouchableOpacity onPress={() => openModal(item)} className="flex-1 bg-blue-50 flex-row justify-center items-center py-2.5 rounded-xl border border-blue-100">
            <Edit2 size={16} color="#2563eb" className="mr-1" />
            <Text className="text-blue-700 font-bold text-sm">Edit Event</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)} className="flex-1 bg-red-50 flex-row justify-center items-center py-2.5 rounded-xl border border-red-100">
            <Trash2 size={16} color="#dc2626" className="mr-1" />
            <Text className="text-red-700 font-bold text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="p-4 bg-gray-50 flex-row justify-between items-center border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900">Festival Events</Text>
        <TouchableOpacity onPress={() => openModal()} className="bg-purple-600 flex-row items-center px-4 py-2 rounded-xl shadow-sm">
          <Plus size={16} color="white" className="mr-1" />
          <Text className="text-white font-bold">New Event</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9333ea" />
        </View>
      ) : (
        <FlatList 
          data={events}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={renderEvent}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Text className="text-gray-500">No events found.</Text>
            </View>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
          <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-100 shadow-sm elevation-1">
            <Text className="text-xl font-black text-gray-900">{editingEvent ? 'Edit Event' : 'Create Special Event'}</Text>
            <TouchableOpacity onPress={closeModal} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5 flex-1" showsVerticalScrollIndicator={false}>
            {/* Image Picker */}
            <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-gray-200 rounded-3xl mb-6 items-center justify-center overflow-hidden border border-gray-300 shadow-sm">
              {imageFile ? (
                 <Image source={{ uri: imageFile.uri }} className="w-full h-full" resizeMode="cover" />
              ) : formData.image ? (
                 <Image source={{ uri: formData.image.startsWith('http') ? formData.image : `http://localhost:5000${formData.image}` }} className="w-full h-full" resizeMode="cover" />
              ) : (
                 <View className="items-center">
                   <ImageIcon size={32} color="#9ca3af" />
                   <Text className="text-gray-500 font-bold mt-2">Upload Banner</Text>
                 </View>
              )}
            </TouchableOpacity>

            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Event Name</Text>
                <TextInput value={formData.name} onChangeText={t => setFormData({...formData, name: t})} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 font-medium shadow-sm" placeholder="e.g. Diwali Mega Sale" />
              </View>
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deadline (YYYY-MM-DD)</Text>
                <TextInput value={formData.deadline} onChangeText={t => setFormData({...formData, deadline: t})} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 font-medium shadow-sm" placeholder="2025-10-31" />
              </View>
            </View>

            {/* Event Products List */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 elevation-1">
              <Text className="text-base font-bold text-gray-900 mb-4">Event Products</Text>
              
              {formData.products.map((p, index) => (
                 <View key={index} className="flex-row justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-2">
                    <View>
                      <Text className="font-bold text-gray-900">{p.name}</Text>
                      <Text className="text-xs text-gray-500">₹{p.price} / {p.unit}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeEventProduct(index)} className="p-2">
                       <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                 </View>
              ))}

              <View className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                 <Text className="text-xs font-bold text-purple-700 uppercase tracking-wider">Add a Product</Text>
                 <TextInput value={newProduct.name} onChangeText={t => setNewProduct({...newProduct, name: t})} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 font-medium" placeholder="Product Name" />
                 
                 <View className="flex-row space-x-2">
                    <View className="flex-1 mr-1">
                      <TextInput value={newProduct.price} onChangeText={t => setNewProduct({...newProduct, price: t})} keyboardType="numeric" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900" placeholder="Price (₹)" />
                    </View>
                    <View className="flex-1 ml-1">
                       <TextInput value={newProduct.stock} onChangeText={t => setNewProduct({...newProduct, stock: t})} keyboardType="numeric" className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900" placeholder="Stock Qty" />
                    </View>
                 </View>

                 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                  {UNITS.map(u => (
                    <TouchableOpacity key={u} onPress={() => setNewProduct({...newProduct, unit: u})} className={`mr-2 px-3 py-1.5 rounded-lg border ${newProduct.unit === u ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}>
                      <Text className={`text-xs font-bold ${newProduct.unit === u ? 'text-white' : 'text-gray-700'}`}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                 </ScrollView>

                 <TouchableOpacity onPress={addEventProduct} className="bg-purple-100 flex-row items-center justify-center py-3 rounded-xl mt-1 border border-purple-200">
                   <Plus size={16} color="#7e22ce" className="mr-1" />
                   <Text className="text-purple-700 font-bold">Add to Event</Text>
                 </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 bg-white border-t border-gray-100">
            <TouchableOpacity onPress={handleSubmit} disabled={submitting} className={`py-4 rounded-xl items-center shadow-sm ${submitting ? 'bg-gray-400' : 'bg-purple-700'}`}>
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">{editingEvent ? 'Update Event' : 'Publish Event'}</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
