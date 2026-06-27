import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingCart, Plus, Minus } from 'lucide-react-native';
import useCartStore from '../../store/useCartStore';

export default function EventDetailsScreen({ route, navigation }) {
  const { event } = route.params;
  const { cart, addToCart, updateQuantity, getCartTotal } = useCartStore();

  const getCartItem = (product) => {
    const unit = product.unit || '1 Piece';
    const id = product._id || product.name;
    const cartItemId = `${id}_${unit}`;
    return cart.find(c => c.cartItemId === cartItemId);
  };

  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id || product.name,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      stock: product.stock || 100
    });
  };

  const renderProduct = ({ item }) => {
    const cartItem = getCartItem(item);
    const qty = cartItem ? cartItem.quantity : 0;
    
    return (
      <View className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex-1 m-1.5 elevation-1 relative">
        <View className="w-full aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden border border-gray-100 p-2">
          {item.image ? (
            <Image source={{ uri: item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}` }} className="w-full h-full" resizeMode="contain" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl">🛍️</Text>
            </View>
          )}
        </View>
        <Text className="font-bold text-gray-900 text-sm mb-1" numberOfLines={2}>{item.name}</Text>
        <Text className="text-gray-500 text-xs mb-2">{item.unit}</Text>
        
        <View className="flex-row items-end justify-between mt-auto pt-2">
          <Text className="font-black text-green-700 text-lg">₹{item.price}</Text>
          
          {qty > 0 ? (
            <View className="flex-row items-center bg-green-50 rounded-lg p-1 border border-green-200">
              <TouchableOpacity onPress={() => updateQuantity(cartItem.cartItemId, qty - 1)} className="p-1">
                <Minus size={14} color="#16a34a" />
              </TouchableOpacity>
              <Text className="font-bold px-2">{qty}</Text>
              <TouchableOpacity onPress={() => handleAddToCart(item)} className="p-1">
                <Plus size={14} color="#16a34a" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleAddToCart(item)} className="bg-green-600 p-2 rounded-xl shadow-sm active:scale-95">
              <Plus size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 shadow-sm elevation-2 pb-2">
        <View className="h-40 w-full relative">
           {event.image && (
             <Image source={{ uri: event.image.startsWith('http') ? event.image : `http://localhost:5000${event.image}` }} className="w-full h-full" resizeMode="cover" />
           )}
           <View className="absolute inset-0 bg-black/40 p-4 justify-between">
              <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/20 items-center justify-center rounded-full border border-white/20">
                 <ChevronLeft size={24} color="#ffffff" />
              </TouchableOpacity>
              <View>
                 <Text className="text-white text-xs font-bold bg-white/20 self-start px-2 py-1 rounded-lg overflow-hidden mb-2 backdrop-blur-md">
                   Special Event
                 </Text>
                 <Text className="text-white text-3xl font-black">{event.name}</Text>
              </View>
           </View>
        </View>
      </View>

      <FlatList 
        data={event.products}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
        renderItem={renderProduct}
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-gray-500 font-medium text-lg">No products available for this event.</Text>
          </View>
        }
      />

      {cartItemCount > 0 && (
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity 
            className="bg-green-700 flex-row items-center justify-between p-4 rounded-2xl shadow-lg elevation-5"
            onPress={() => navigation.navigate('Checkout')}
          >
            <View className="flex-row items-center">
              <View className="bg-green-800 p-2 rounded-xl mr-3">
                <ShoppingCart color="white" size={20} />
              </View>
              <View>
                <Text className="text-white font-bold">{cartItemCount} items</Text>
                <Text className="text-green-100 text-xs font-semibold">₹{getCartTotal()}</Text>
              </View>
            </View>
            <Text className="text-white font-bold text-base">View Cart →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
