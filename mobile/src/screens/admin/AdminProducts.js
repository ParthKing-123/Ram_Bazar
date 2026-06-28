import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react-native';
import api, { BASE_URL } from '../../services/api';

const CATEGORIES = ['Grocery', 'Provision', 'Household', 'Loose Grocery', 'Travel Accessories'];
const UNITS = ['1 Piece', '1 kg', '500 g', '250 g', '1 L', '500 ml', '1 Dozen', '1 Pack'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    price: '',
    unit: '1 Piece',
    stock: '100',
    image: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category || 'Grocery',
        price: product.price ? product.price.toString() : '',
        unit: product.unit || '1 Piece',
        stock: product.stock ? product.stock.toString() : '100',
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Grocery',
        price: '',
        unit: '1 Piece',
        stock: '100',
        image: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const pickImage = async () => {
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
      name: 'upload.jpg',
      type: file.mimeType || 'image/jpeg',
      uri: file.uri,
    });
    
    const res = await api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.imageUrl;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Name and Price are required.');
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
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: finalImageUrl,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      fetchProducts();
      closeModal();
      Alert.alert('Success', `Product ${editingProduct ? 'updated' : 'added'}!`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            fetchProducts();
          } catch (error) {
            console.error(error);
          }
      }}
    ]);
  };

  const renderProduct = ({ item }) => (
    <View className="bg-white p-3 rounded-2xl shadow-sm mb-3 border border-gray-100 flex-row items-center">
      <View className="w-14 h-14 bg-gray-100 rounded-xl mr-3 overflow-hidden border border-gray-200">
        {item.image ? (
          <Image source={{ uri: item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}` }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ImageIcon size={20} color="#9ca3af" />
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-bold text-gray-900" numberOfLines={1}>{item.name}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">{item.category}</Text>
        <Text className="text-green-700 font-black mt-1">₹{item.price} <Text className="text-gray-400 font-medium text-xs">/ {item.unit}</Text></Text>
      </View>
      <View className="flex-col gap-2">
        <TouchableOpacity onPress={() => openModal(item)} className="bg-blue-50 p-2 rounded-lg">
          <Edit2 size={16} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} className="bg-red-50 p-2 rounded-lg">
          <Trash2 size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="p-4 bg-gray-50 flex-row justify-between items-center border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900">Inventory ({products.length})</Text>
        <TouchableOpacity onPress={() => openModal()} className="bg-green-600 flex-row items-center px-4 py-2 rounded-xl shadow-sm">
          <Plus size={16} color="white" className="mr-1" />
          <Text className="text-white font-bold">Add Product</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList 
          data={products}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={renderProduct}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Text className="text-gray-500">No products found.</Text>
            </View>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-100">
            <Text className="text-xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
            <TouchableOpacity onPress={closeModal} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5 flex-1" showsVerticalScrollIndicator={false}>
            {/* Image Picker */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} className="w-32 h-32 bg-gray-100 rounded-3xl items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative shadow-sm">
                {imageFile ? (
                   <Image source={{ uri: imageFile.uri }} className="w-full h-full" resizeMode="cover" />
                ) : formData.image ? (
                   <Image source={{ uri: formData.image.startsWith('http') ? formData.image : `${BASE_URL}${formData.image}` }} className="w-full h-full" resizeMode="cover" />
                ) : (
                   <View className="items-center">
                     <ImageIcon size={32} color="#9ca3af" />
                     <Text className="text-gray-500 text-xs font-bold mt-2">Upload Photo</Text>
                   </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</Text>
                <TextInput value={formData.name} onChangeText={t => setFormData({...formData, name: t})} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 font-medium shadow-sm" placeholder="e.g. Fresh Tomatoes" />
              </View>
              
              {/* Note: React Native doesn't have a built-in <select>. Building a simple horizontal scroll selector instead */}
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setFormData({...formData, category: cat})} className={`mr-2 px-4 py-2 rounded-xl border ${formData.category === cat ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <Text className={`font-bold ${formData.category === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (₹)</Text>
                  <TextInput value={formData.price} onChangeText={t => setFormData({...formData, price: t})} keyboardType="numeric" className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 font-medium shadow-sm" placeholder="0" />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Qty</Text>
                  <TextInput value={formData.stock} onChangeText={t => setFormData({...formData, stock: t})} keyboardType="numeric" className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 font-medium shadow-sm" placeholder="100" />
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {UNITS.map(u => (
                    <TouchableOpacity key={u} onPress={() => setFormData({...formData, unit: u})} className={`mr-2 px-4 py-2 rounded-xl border ${formData.unit === u ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <Text className={`font-bold ${formData.unit === u ? 'text-white' : 'text-gray-700'}`}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </ScrollView>

          <View className="p-4 bg-white border-t border-gray-100">
            <TouchableOpacity onPress={handleSubmit} disabled={submitting} className={`py-4 rounded-xl items-center shadow-sm ${submitting ? 'bg-gray-400' : 'bg-green-700'}`}>
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">{editingProduct ? 'Save Changes' : 'Publish Product'}</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
