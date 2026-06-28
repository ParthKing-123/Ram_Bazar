import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import useCartStore from '../store/useCartStore';
import useThemeStore from '../store/useThemeStore';
import useLanguageStore from '../store/useLanguageStore';
import { getImageUrl } from '../services/api';

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { isDarkMode } = useThemeStore();
  const { t, language } = useLanguageStore();
  
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
        <View className="relative">
          <Image 
            source={{ uri: getImageUrl(product.image) }} 
            className="w-full aspect-square rounded-xl mb-3 bg-gray-100"
            resizeMode="cover"
          />
          {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
              <Text className="text-white text-[10px] font-bold tracking-tight">{t('only')} {product.stock} {t('left')}!</Text>
            </View>
          )}
          {product.stock === 0 && (
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 rounded-xl mb-3 items-center justify-center">
              <Text className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-md">{t('out_of_stock') || 'Out of Stock'}</Text>
            </View>
          )}
        </View>
      )}
      <Text className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
        {language === 'mr' && product.name_mr ? product.name_mr : product.name}
      </Text>
      <Text className={`text-xs mt-1 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.unit || '1 Piece'}</Text>
      <Text className="text-lg font-bold text-green-500 mb-3">₹{product.price}</Text>
      
      <TouchableOpacity 
        className={`rounded-xl py-2 items-center ${product.stock === 0 ? 'bg-gray-400' : 'bg-green-600 active:bg-green-700'}`}
        onPressIn={product.stock === 0 ? undefined : handlePressIn}
        onPressOut={product.stock === 0 ? undefined : handlePressOut}
        onPress={product.stock === 0 ? undefined : handleAdd}
        disabled={product.stock === 0}
      >
        <Text className="text-white font-semibold">{t('add') || 'Add'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
