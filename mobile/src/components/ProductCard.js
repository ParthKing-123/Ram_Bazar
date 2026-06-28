import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import useLanguageStore from '../store/useLanguageStore';
import { BASE_URL } from '../services/api';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleAdd = () => {
    addToCart(product);
  };

  return (
    <Animated.View 
      style={{ transform: [{ scale: scaleAnim }] }}
      className={`rounded-2xl p-3 border shadow-sm m-2 flex-1 max-w-[48%] ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
    >
      {product.image && (
        <Image 
          source={{ uri: getImageUrl(product.image) }} 
          className="w-full aspect-square rounded-xl mb-3 bg-gray-100"
          resizeMode="cover"
        />
      )}
      <Text className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
        {product.name}
      </Text>
      <Text className={`text-xs mt-1 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.unit || '1 Piece'}</Text>
      <Text className="text-lg font-bold text-green-500 mb-3">₹{product.price}</Text>
      
      <TouchableOpacity 
        className="bg-green-600 rounded-xl py-2 items-center active:bg-green-700"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleAdd}
      >
        <Text className="text-white font-semibold">{t('add') || 'Add'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
