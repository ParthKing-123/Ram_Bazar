import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCartStore from '../../store/useCartStore';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 30;

export default function CheckoutScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const { customer, setCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.isFreeProduct) {
      let highestEligible = 0;
      cart.forEach(item => {
        if (item.price <= 200 && item.price > highestEligible) {
          highestEligible = item.price;
        }
      });
      discountAmount = highestEligible;
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }
  
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  const applyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    
    // Check if customer has this coupon
    const found = customer?.coupons?.find(c => c.code === couponCode.trim().toUpperCase());
    if (found) {
      if (new Date() > new Date(found.expiresAt)) {
        setCouponError('This coupon has expired');
        return;
      }
      setAppliedCoupon(found);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = async () => {
    if (!customer) {
      Alert.alert('Error', 'Customer not found');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        items: cart,
        total: subtotal + deliveryFee, // The backend applies the discount on its end for security, we send the pre-discount total
        paymentMethod: 'Offline',
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };

      const res = await api.post('/orders', orderData);
      
      // The backend deducts the coupon and potentially awards points. We should fetch fresh customer data
      const customerRes = await api.get(`/customers/${customer._id}`);
      setCustomer(customerRes.data);
      
      clearCart();

      const adminPhone = '919028535600';
      const itemList = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
      const message = `Hi Padmavati super bazar, I have placed an order!\n\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\nItems: ${itemList}\n\nTotal: ₹${finalTotal}\nPayment: Cash on Delivery\n\nPlease confirm my order.`;
      
      Linking.openURL(`whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(message)}`)
        .catch(() => Alert.alert('Notice', 'Order placed successfully! (WhatsApp not installed)'));
        
      Alert.alert('Success', 'Order Placed successfully!');
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error', 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-gray-500 mb-4 text-lg">Your cart is empty.</Text>
        <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-xl" onPress={() => navigation.goBack()}>
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="p-4 mb-24">
        <Text className="text-2xl font-bold mb-4 text-gray-900">Checkout</Text>
        
        {/* Customer Details */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="font-bold text-gray-900 mb-2">Delivery Details</Text>
          <Text className="text-gray-700">{customer?.name}</Text>
          <Text className="text-gray-500">{customer?.phone}</Text>
          <Text className="text-gray-500 mt-1">{customer?.address || 'No address provided'}</Text>
        </View>

        {/* Cart Items */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="font-bold text-gray-900 mb-4">{cart.length} Items</Text>
          {cart.map((item, idx) => (
            <View key={idx} className="flex-row justify-between items-center border-b border-gray-100 pb-3 mb-3">
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{item.name}</Text>
                <Text className="text-green-700 font-bold">₹{item.price}</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-3 py-1 bg-gray-100 rounded-l-md"><Text>-</Text></TouchableOpacity>
                <Text className="px-3">{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 bg-green-100 rounded-r-md"><Text>+</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <Text className="font-bold text-gray-900 mb-3">Bill Summary</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Item Total</Text>
            <Text className="text-gray-600">₹{subtotal}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="text-gray-600">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
          </View>
          {appliedCoupon && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-600 font-bold">Coupon Discount ({appliedCoupon.code})</Text>
              <Text className="text-green-600 font-bold">-₹{discountAmount}</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
            <Text className="font-bold text-lg text-gray-900">Grand Total</Text>
            <Text className="font-bold text-lg text-green-700">₹{finalTotal}</Text>
          </View>
        </View>

        {/* Coupon Section */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
           <Text className="font-bold text-gray-900 mb-3">Apply Coupon</Text>
           {appliedCoupon ? (
             <View className="bg-green-50 border border-green-200 p-3 rounded-lg flex-row justify-between items-center">
                <View>
                  <Text className="text-green-800 font-bold">{appliedCoupon.code}</Text>
                  <Text className="text-green-600 text-xs mt-0.5">Coupon applied successfully!</Text>
                </View>
                <TouchableOpacity onPress={removeCoupon} className="p-2">
                  <Text className="text-red-500 font-bold text-xs">Remove</Text>
                </TouchableOpacity>
             </View>
           ) : (
             <View>
               <View className="flex-row">
                 <TextInput 
                   value={couponCode}
                   onChangeText={setCouponCode}
                   autoCapitalize="characters"
                   placeholder="Enter Coupon Code"
                   className="flex-1 border border-gray-200 rounded-l-lg px-4 py-2 bg-gray-50 text-gray-900 font-bold"
                 />
                 <TouchableOpacity onPress={applyCoupon} className="bg-gray-900 px-6 justify-center items-center rounded-r-lg">
                   <Text className="text-white font-bold">Apply</Text>
                 </TouchableOpacity>
               </View>
               {couponError ? <Text className="text-red-500 text-xs mt-2">{couponError}</Text> : null}
               {customer?.coupons?.length > 0 && (
                 <View className="mt-4 border-t border-gray-100 pt-3">
                   <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Available Coupons</Text>
                   {customer.coupons.map((c, idx) => (
                     <TouchableOpacity key={idx} onPress={() => { setCouponCode(c.code); applyCoupon(); }} className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg mb-2 flex-row justify-between items-center">
                       <Text className="font-bold text-yellow-800">{c.code}</Text>
                       <Text className="text-yellow-700 font-bold text-xs">{c.isFreeProduct ? 'Free Item' : `₹${c.discount} OFF`}</Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               )}
             </View>
           )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 p-4 pb-8 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-xs">To Pay</Text>
          <Text className="text-xl font-bold text-gray-900">₹{finalTotal}</Text>
        </View>
        <TouchableOpacity 
          className={`bg-green-600 px-8 py-3 rounded-xl flex-row items-center ${loading ? 'opacity-70' : ''}`}
          onPress={placeOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Place Order</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
