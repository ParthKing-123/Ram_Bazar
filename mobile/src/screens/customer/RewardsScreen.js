import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Share, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Gift, Award, Star, Ticket, CheckCircle, ChevronRight, Target, Sparkles } from 'lucide-react-native';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

export default function RewardsScreen({ navigation }) {
  const { customer, setCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [claimingState, setClaimingState] = useState(null); // id of task being claimed

  const floatingAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Auto-refresh customer data on load
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${customer._id}`);
      // Assuming a GET /customers/:id endpoint exists. If not, the data in `customer` from Context is mostly fine, 
      // but it's best to keep it fresh. We will fall back to existing data if no GET endpoint is implemented.
      if (res.data) setCustomer(res.data);
    } catch (error) {
      console.log('Using cached profile data');
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  const points = customer.points || 0;
  const coupons = customer.coupons || [];
  const progressPercentage = Math.min((points / 500) * 100, 100);

  const triggerClaimAnimation = () => {
    // Reset
    floatingAnim.setValue(0);
    scaleAnim.setValue(0.5);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(floatingAnim, {
        toValue: -150, // Float up 150px
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.5,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        })
      ])
    ]).start();
  };

  const handleClaim = async (taskId, taskApiString) => {
    try {
      setClaimingState(taskId);
      const res = await api.post(`/customers/${customer._id}/claim`, { task: taskApiString });
      
      triggerClaimAnimation();
      
      // Update local state to reflect new points
      setCustomer({ ...customer, points: res.data.points, profilePointsAwarded: res.data.profilePointsAwarded });
    } catch (error) {
      console.error('Failed to claim:', error);
    } finally {
      setTimeout(() => setClaimingState(null), 1500); // Give animation time to play
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative">
      {/* Floating Animation Layer */}
      <Animated.View 
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '40%',
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          opacity: opacityAnim,
          transform: [
            { translateY: floatingAnim },
            { scale: scaleAnim }
          ]
        }}
      >
        <View className="bg-green-500 rounded-full px-6 py-3 shadow-lg flex-row items-center border-4 border-green-300">
          <Sparkles size={24} color="white" className="mr-2" />
          <Text className="text-white font-black text-3xl">+100</Text>
        </View>
      </Animated.View>

      <View className="bg-white border-b border-gray-200 shadow-sm elevation-2 pb-4 pt-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ChevronLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-gray-900 tracking-tight flex-1">Rewards</Text>
        <TouchableOpacity onPress={fetchProfile} className="bg-gray-100 p-2 rounded-full">
           {loading ? <ActivityIndicator size="small" color="#16a34a" /> : <Star size={20} color="#f59e0b" />}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Points Display */}
        <View className="bg-green-700 rounded-3xl p-6 shadow-lg elevation-5 mb-6 overflow-hidden relative">
          <View className="absolute -right-10 -top-10 opacity-10">
            <Award size={150} color="#ffffff" />
          </View>
          <Text className="text-green-100 font-bold uppercase tracking-widest text-xs mb-1">Your Balance</Text>
          <View className="flex-row items-end">
             <Text className="text-white text-5xl font-black">{points}</Text>
             <Text className="text-green-200 text-lg font-bold ml-2 mb-2">Points</Text>
          </View>
          
          <View className="mt-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-50 text-xs font-semibold">Progress to ₹50 Coupon</Text>
              <Text className="text-green-50 text-xs font-bold">{points}/500</Text>
            </View>
            <View className="h-3 bg-black/20 rounded-full overflow-hidden">
              <View style={{ width: `${progressPercentage}%` }} className="h-full bg-yellow-400 rounded-full" />
            </View>
            <Text className="text-green-100 text-xs mt-2 italic">Earn 50 points on your first order. 100 points for completing your profile!</Text>
          </View>
        </View>

        {/* Tasks Section */}
        <Text className="text-lg font-black text-gray-900 mb-3 px-1 flex-row items-center">
           Earn More Points
        </Text>
        
        <View className="mb-6">
          {[
            {
              id: 1,
              title: 'Complete Profile',
              description: 'Add your email & photo',
              points: '+100',
              completed: customer.profilePointsAwarded,
              claimable: (!customer.profilePointsAwarded && customer.email && customer.profileImage),
              action: () => navigation.navigate('Home', { screen: 'ProfileTab' }),
              claimAction: () => handleClaim(1, 'profile')
            },
            {
              id: 2,
              title: 'First Order',
              description: 'Make your very first purchase',
              points: '+50',
              completed: customer.firstOrderPointsAwarded,
              action: () => navigation.navigate('Home', { screen: 'HomeTab' })
            },
            {
              id: 3,
              title: 'Rate a Delivery',
              description: 'Give feedback on your recent order',
              points: '+20',
              completed: false, // Placeholder logic
              action: () => navigation.navigate('Home', { screen: 'OrdersTab' })
            },
            {
              id: 4,
              title: 'Refer a Friend',
              description: 'Share your referral code with a friend',
              points: '+200',
              completed: false,
              action: async () => {
                try {
                  await Share.share({
                    message: `Join Padmavati Super Bazar! Use my referral code ${customer?.referralCode || 'FRIEND'} when you sign up to get bonus points: https://padmavati.com/app.apk`
                  });
                } catch(e) {}
              }
            },
            {
              id: 5,
              title: 'Share on WhatsApp',
              description: 'Share a product you love',
              points: '+10',
              completed: false,
              action: async () => {
                try {
                  await Share.share({
                    message: 'Check out Padmavati Super Bazar! The best place to buy groceries. Download the app here: https://padmavati.com/app.apk'
                  });
                } catch (error) {}
              }
            },
            {
              id: 6,
              title: 'Buy Fresh Veggies',
              description: 'Order from the vegetables category',
              points: '+30',
              completed: false,
              action: () => navigation.navigate('Home', { screen: 'HomeTab' })
            },
            {
              id: 7,
              title: 'Weekend Special',
              description: 'Place an order on Saturday or Sunday',
              points: '+50',
              completed: false,
              action: () => navigation.navigate('Home', { screen: 'HomeTab' })
            },
            {
              id: 8,
              title: 'Leave an App Review',
              description: 'Rate us on the Play Store',
              points: '+50',
              completed: false,
              action: () => {}
            },
            {
              id: 9,
              title: 'Big Spender',
              description: 'Spend ₹1000 in a single order',
              points: '+100',
              completed: false,
              action: () => navigation.navigate('Home', { screen: 'HomeTab' })
            },
            {
              id: 10,
              title: '10th Order Milestone',
              description: `Complete 10 orders (${customer.totalOrders || 0}/10)`,
              points: 'Free Product',
              completed: (customer.totalOrders || 0) >= 10,
              action: () => navigation.navigate('Home', { screen: 'HomeTab' })
            }
          ].map((task, index) => (
            <TouchableOpacity 
              key={task.id} 
              onPress={task.completed || task.claimable ? null : task.action}
              activeOpacity={task.completed || task.claimable ? 1 : 0.7}
              className={`bg-white p-4 rounded-2xl shadow-sm border mb-3 flex-row items-center ${task.completed ? 'border-green-200 bg-green-50/30' : task.claimable ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}`}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${task.completed ? 'bg-green-100' : task.claimable ? 'bg-yellow-100' : 'bg-blue-50'}`}>
                {task.completed ? <CheckCircle size={24} color="#16a34a" /> : task.claimable ? <Gift size={24} color="#d97706" /> : <Target size={24} color="#3b82f6" />}
              </View>
              <View className="flex-1">
                <Text className={`font-black text-base ${task.completed ? 'text-green-800 line-through' : task.claimable ? 'text-yellow-800' : 'text-gray-900'}`}>{task.title}</Text>
                <Text className={`${task.claimable ? 'text-yellow-600' : 'text-gray-500'} text-xs mt-0.5 font-medium`}>{task.description}</Text>
              </View>
              <View className="items-end ml-2">
                {task.claimable ? (
                  <TouchableOpacity 
                    onPress={task.claimAction}
                    disabled={claimingState === task.id}
                    className="bg-yellow-400 px-4 py-2 rounded-xl shadow-sm flex-row items-center"
                  >
                    {claimingState === task.id ? <ActivityIndicator size="small" color="#fff" /> : <Text className="font-bold text-yellow-900">Claim</Text>}
                  </TouchableOpacity>
                ) : task.completed ? (
                  <Text className="text-green-600 font-bold text-xs uppercase tracking-wider mb-1">Done</Text>
                ) : (
                  <>
                    <Text className="text-blue-600 font-black text-sm mb-1">{task.points}</Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coupons List */}
        <Text className="text-lg font-black text-gray-900 mb-3 px-1">Your Coupons</Text>
        
        {coupons.length === 0 ? (
          <View className="bg-white p-8 rounded-3xl border border-gray-200 border-dashed items-center justify-center">
            <Gift size={48} color="#9ca3af" className="mb-4" />
            <Text className="text-gray-500 font-bold text-base text-center">No coupons yet!</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">Earn 500 points or complete your 10th order to unlock amazing rewards.</Text>
          </View>
        ) : (
          coupons.map((coupon, idx) => (
            <View key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-3 flex-row items-center">
              <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${coupon.isFreeProduct ? 'bg-purple-100' : 'bg-yellow-100'}`}>
                {coupon.isFreeProduct ? (
                  <Gift size={28} color="#9333ea" />
                ) : (
                  <Ticket size={28} color="#d97706" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-black text-lg text-gray-900">
                  {coupon.isFreeProduct ? 'Free Product' : `₹${coupon.discount} OFF`}
                </Text>
                <Text className="text-gray-500 font-medium text-xs mt-0.5">
                  Code: <Text className="font-bold text-gray-800">{coupon.code}</Text>
                </Text>
                <Text className="text-red-500 font-semibold text-xs mt-1">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
