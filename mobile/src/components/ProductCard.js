import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import useCartStore from '../store/useCartStore';

const BACKEND_URL = 'http://192.168.1.56:5000';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();

  return (
    <View className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm m-2 flex-1 max-w-[48%]">
      {product.image && (
        <Image 
          source={{ uri: getImageUrl(product.image) }} 
          className="w-full aspect-square rounded-xl mb-3 bg-gray-100"
          resizeMode="cover"
        />
      )}
      <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
        {product.name}
      </Text>
      <Text className="text-gray-500 text-xs mt-1 mb-2">{product.unit || '1 Piece'}</Text>
      <Text className="text-lg font-bold text-green-600 mb-3">₹{product.price}</Text>
      
      <TouchableOpacity 
        className="bg-green-600 rounded-xl py-2 items-center"
        onPress={() => addToCart(product)}
      >
        <Text className="text-white font-semibold">Add</Text>
      </TouchableOpacity>
    </View>
  );
}
