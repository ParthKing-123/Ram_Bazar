import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, Clock, Star, Heart, ExternalLink, Shield, Truck, ChevronRight } from 'lucide-react-native';

export default function AboutScreen() {
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
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
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
                <View key={index} className="bg-white rounded-3xl p-4 w-[48%] mb-4 shadow-sm border border-gray-100 items-center elevation-2">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${item.bg}`}>
                    <Icon size={24} color={item.color} />
                  </View>
                  <Text className="font-black text-2xl text-gray-900 tracking-tight">{item.value}</Text>
                  <Text className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider text-center">{item.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Location Card */}
          <View className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 elevation-2">
            <View className="flex-row items-center mb-5">
              <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                <MapPin size={24} color="#2563eb" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">Find Us</Text>
                <Text className="text-gray-500 text-sm">Pethvadgaon, Maharashtra</Text>
              </View>
            </View>
            
            <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 flex-row items-center">
               <MapPin size={16} color="#ef4444" className="mr-2" />
               <Text className="text-gray-700 font-medium flex-1">Padmavati super bazar</Text>
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
          <View className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 elevation-2">
            <View className="flex-row items-center mb-5">
              <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                <Clock size={24} color="#16a34a" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">Store Hours</Text>
                <Text className="text-gray-500 text-sm">Open 7 Days a week</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="font-bold text-gray-700 text-base">Mon - Sun</Text>
              </View>
              <Text className="font-black text-green-700 text-lg">9:00 AM – 8:00 PM</Text>
            </View>
          </View>

          {/* Contact Support Card */}
          <View className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 elevation-2">
            <View className="flex-row items-center mb-5">
              <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mr-4">
                <Phone size={24} color="#9333ea" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">Contact Us</Text>
                <Text className="text-gray-500 text-sm">We're here to help</Text>
              </View>
            </View>

            <View className="space-y-4">
              {/* Contact 1 */}
              <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="font-bold text-gray-900 text-lg">Amit Kulkarni</Text>
                    <Text className="text-green-600 text-xs font-bold uppercase tracking-wider mt-1">Store Manager</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => callPhone('9028535600')} className="flex-1 bg-white border-2 border-green-100 flex-row items-center justify-center py-3 rounded-xl">
                    <Phone size={16} color="#16a34a" className="mr-2" />
                    <Text className="text-green-700 font-bold">Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openWhatsApp('9028535600')} className="flex-1 bg-[#25D366] flex-row items-center justify-center py-3 rounded-xl shadow-sm">
                    <Text className="text-white font-bold">WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact 2 */}
              <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="font-bold text-gray-900 text-lg">Ashish Mehta</Text>
                    <Text className="text-green-600 text-xs font-bold uppercase tracking-wider mt-1">Support Lead</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => callPhone('9028533002')} className="flex-1 bg-white border-2 border-green-100 flex-row items-center justify-center py-3 rounded-xl">
                    <Phone size={16} color="#16a34a" className="mr-2" />
                    <Text className="text-green-700 font-bold">Call</Text>
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
