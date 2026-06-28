import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart } from 'lucide-react-native';
import useCustomerStore from '../../store/useCustomerStore';
import useCartStore from '../../store/useCartStore';
import useSearchStore from '../../store/useSearchStore';
import useLanguageStore from '../../store/useLanguageStore';
import useThemeStore from '../../store/useThemeStore';
import api, { getImageUrl } from '../../services/api';
import ProductCard from '../../components/ProductCard';

const CATEGORIES = ['All', 'Grocery', 'Provision', 'Household', 'Loose Grocery', 'Travel Accessories'];

export default function HomeScreen({ navigation }) {
  const { customer } = useCustomerStore();
  const { cart, getCartTotal } = useCartStore();
  const { selectedCategory, setSelectedCategory, searchTerm } = useSearchStore();
  const { t } = useLanguageStore();
  const { isDarkMode } = useThemeStore();
  
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) {
      navigation.replace('Login');
      return;
    }
    fetchData();
  }, [customer]);

  const fetchData = async () => {
    try {
      const [productsRes, eventsRes] = await Promise.all([
        api.get('/products'),
        api.get('/events')
      ]);
      setProducts(productsRes.data);
      setEvents(eventsRes.data.filter(e => e.isActive && new Date(e.deadline) > new Date()));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  let filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const renderHeader = () => (
    <View>
      <View className="px-4 pt-6 pb-2">
        <Text className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('welcome')}, {customer?.name?.split(' ')[0] || 'Guest'} 👋
        </Text>
        <Text className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>What would you like to order today?</Text>
      </View>

      {/* Active Events Banner List */}
      {events.length > 0 && searchTerm === '' && selectedCategory === 'All' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 py-2 mb-2">
          {events.map(event => (
            <TouchableOpacity 
              key={event._id}
              onPress={() => navigation.navigate('EventDetails', { event })}
              className="w-72 h-36 rounded-3xl mr-4 overflow-hidden shadow-sm border border-gray-100 elevation-2 relative"
            >
              {event.image && (
                <Image source={{ uri: getImageUrl(event.image) }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
              )}
              <View className="absolute inset-0 bg-black/40 p-4 justify-end">
                <Text className="text-white text-2xl font-black">{event.name}</Text>
                <Text className="text-white text-xs font-bold mt-1 bg-white/20 self-start px-2 py-1 rounded-lg overflow-hidden backdrop-blur-md">Explore Festival Special</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View className="px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-3 px-5 py-2.5 rounded-xl border ${selectedCategory === cat ? 'bg-green-600 border-green-600 shadow-sm' : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-semibold ${selectedCategory === cat ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {cat === 'All' ? t('all_categories') : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <FlatList 
        data={filteredProducts}
        keyExtractor={item => item._id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 160 }}
        columnWrapperStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1, marginHorizontal: 4 }}>
             <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-500">No products found.</Text>
          </View>
        }
      />

      {cartItemCount > 0 && (
        <View className="absolute bottom-44 left-4 right-4">
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
