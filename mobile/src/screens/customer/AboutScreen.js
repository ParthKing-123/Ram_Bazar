import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, Clock, Star, Heart, ExternalLink, Shield, Truck, ChevronRight } from 'lucide-react-native';
import useThemeStore from '../../store/useThemeStore';

export default function AboutScreen() {
  const { isDarkMode } = useThemeStore();
  const openMaps = () => {
    Linking.openURL('https://maps.app.goo.gl/krznerZPoD5sghEW8');
  };

  const callPhone = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (phone) => {
    Linking.openURL(`https://wa.me/91${phone}`);
  };

  const stats = [
    { icon: Star, value: '20+', label: 'Years of Trust', color: '#f59e0b', bg: 'bg-amber-50' }, // amber-500
    { icon: Heart, value: '10k+', label: 'Happy Customers', color: '#f43f5e', bg: 'bg-rose-50' }, // rose-500
    { icon: Shield, value: '100%', label: 'Quality Assured', color: '#10b981', bg: 'bg-emerald-50' }, // emerald-500
    { icon: Truck, value: 'Fast', label: 'Delivery', color: '#3b82f6', bg: 'bg-blue-50' }, // blue-500
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-[#F8F9FA]'}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Premium Header Section */}
        <View className="bg-green-800 rounded-b-[40px] pt-10 pb-16 px-6 items-center shadow-lg elevation-5 overflow-hidden">
          {/* Background Decorative Pattern */}
          <View className="absolute inset-0 opacity-10 bg-white" style={{ opacity: 0.05 }} />

          <View className="w-28 h-28 bg-white rounded-3xl p-1 mb-5 shadow-2xl elevation-10">
            <Image 
              source={require('../../../assets/logo.jpg')} 
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          </View>

          <Text className="text-3xl font-black text-white text-center tracking-tight">
            Padmavati Super Bazar
          </Text>
          <Text className="text-green-100 text-base mt-3 font-medium text-center px-4 leading-relaxed">
            Serving the Pethvadgaon community with quality products since 2004.
          </Text>

          <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full mt-6">
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-white font-bold ml-2">Trusted Since 2004</Text>
          </View>
        </View>

        <View className="px-5 -mt-8 space-y-6">
          
          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={index} className={`rounded-3xl p-4 w-[48%] mb-4 shadow-sm border items-center elevation-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${isDarkMode ? item.bg.replace('50', '900/50') : item.bg}`}>
                    <Icon size={24} color={item.color} />
                  </View>
                  <Text className={`font-black text-2xl tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</Text>
                  <Text className={`text-xs font-bold mt-1 uppercase tracking-wider text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Location Card */}
          <View className={`rounded-[30px] p-6 shadow-sm border elevation-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="flex-row items-center mb-5">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                <MapPin size={24} color="#2563eb" />
              </View>
              <View>
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Find Us</Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pethvadgaon, Maharashtra</Text>
              </View>
            </View>
            
            <View className={`rounded-2xl p-4 mb-4 border flex-row items-center ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
               <MapPin size={16} color="#ef4444" className="mr-2" />
               <Text className={`font-medium flex-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Padmavati super bazar</Text>
            </View>

            <TouchableOpacity 
              onPress={openMaps}
              className="bg-blue-600 flex-row items-center justify-center py-4 rounded-2xl shadow-sm elevation-2 active:scale-95"
            >
              <ExternalLink size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white font-bold text-base">Open in Google Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Store Hours Card */}
          <View className={`rounded-[30px] p-6 shadow-sm border elevation-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="flex-row items-center mb-5">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-green-900/50' : 'bg-green-50'}`}>
                <Clock size={24} color="#16a34a" />
              </View>
              <View>
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Store Hours</Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open 7 Days a week</Text>
              </View>
            </View>

            <View className={`flex-row justify-between items-center p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className={`font-bold text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Mon - Sun</Text>
              </View>
              <Text className="font-black text-green-500 text-lg">9:00 AM – 8:00 PM</Text>
            </View>
          </View>

          {/* Contact Support Card */}
          <View className={`rounded-[30px] p-6 shadow-sm border elevation-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="flex-row items-center mb-5">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                <Phone size={24} color="#9333ea" />
              </View>
              <View>
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Us</Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>We're here to help</Text>
              </View>
            </View>

            <View className="space-y-4">
              {/* Contact 1 */}
              <View className={`rounded-2xl p-5 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Amit Kulkarni</Text>
                    <Text className={`text-xs font-bold uppercase tracking-wider mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Store Manager</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => callPhone('9028535600')} className={`flex-1 border-2 flex-row items-center justify-center py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-green-100'}`}>
                    <Phone size={16} color="#16a34a" className="mr-2" />
                    <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-green-700'}`}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openWhatsApp('9028535600')} className="flex-1 bg-[#25D366] flex-row items-center justify-center py-3 rounded-xl shadow-sm">
                    <Text className="text-white font-bold">WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact 2 */}
              <View className={`rounded-2xl p-5 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ashish Mehta</Text>
                    <Text className={`text-xs font-bold uppercase tracking-wider mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Support Lead</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => callPhone('9028533002')} className={`flex-1 border-2 flex-row items-center justify-center py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-green-100'}`}>
                    <Phone size={16} color="#16a34a" className="mr-2" />
                    <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-green-700'}`}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openWhatsApp('9028533002')} className="flex-1 bg-[#25D366] flex-row items-center justify-center py-3 rounded-xl shadow-sm">
                    <Text className="text-white font-bold">WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <View className="items-center py-8 opacity-60">
            <Text className="text-gray-500 font-bold mb-1">Padmavati Super Bazar</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-xs font-medium">Made with </Text>
              <Heart size={12} color="#ef4444" fill="#ef4444" className="mx-1" />
              <Text className="text-gray-400 text-xs font-medium"> for the community</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
