import './global.css';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, ClipboardList, Info, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/customer/LoginScreen';
import SignupScreen from './src/screens/customer/SignupScreen';
import HomeScreen from './src/screens/customer/HomeScreen';
import OrdersScreen from './src/screens/customer/OrdersScreen';
import AboutScreen from './src/screens/customer/AboutScreen';
import ProfileScreen from './src/screens/customer/ProfileScreen';
import AdminLogin from './src/screens/admin/AdminLogin';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import CheckoutScreen from './src/screens/customer/CheckoutScreen';
import EventDetailsScreen from './src/screens/customer/EventDetailsScreen';
import RewardsScreen from './src/screens/customer/RewardsScreen';
import useCustomerStore from './src/store/useCustomerStore';
import useThemeStore from './src/store/useThemeStore';
import { View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'HomeTab') IconComponent = Home;
          else if (route.name === 'OrdersTab') IconComponent = ClipboardList;
          else if (route.name === 'AboutTab') IconComponent = Info;
          else if (route.name === 'ProfileTab') IconComponent = User;
          
          return <IconComponent size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
        },
        tabBarActiveTintColor: '#15803d', // brand-700
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        tabBarStyle: {
          position: 'absolute',
          bottom: 60,
          left: 20,
          right: 20,
          borderRadius: 30,
          borderTopWidth: 0,
          backgroundColor: '#ffffff',
          height: 64,
          paddingBottom: 0,
          paddingTop: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="AboutTab" component={AboutScreen} options={{ title: 'About' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { initCustomer, isInitialized } = useCustomerStore();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    initCustomer();
  }, []);

  if (!isInitialized) return null; // Or a splash screen

  return (
    <View className={`flex-1 ${isDarkMode ? 'dark bg-slate-900' : 'bg-white'}`}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={MainTabNavigator} />
          <Stack.Screen 
            name="Checkout" 
            component={CheckoutScreen} 
            options={{ title: 'Checkout', headerShown: true }}
          />
          <Stack.Screen 
            name="EventDetails" 
            component={EventDetailsScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Rewards" 
            component={RewardsScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen name="AdminLogin" component={AdminLogin} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </View>
  );
}
