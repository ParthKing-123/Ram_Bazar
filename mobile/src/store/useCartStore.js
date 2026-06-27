import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const useCartStore = create((set, get) => ({
  cart: [],
  
  loadCart: async () => {
    try {
      const saved = await SecureStore.getItemAsync('rambazar_cart');
      if (saved) set({ cart: JSON.parse(saved) });
    } catch (e) {}
  },

  addToCart: (product, variant = null) => {
    const { cart } = get();
    const unit = variant ? variant.unit : (product.unit || '1 Piece');
    const price = variant ? variant.price : product.price;
    const cartItemId = `${product._id}_${unit}`;

    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    const stock = product.stock || 0;

    let newCart;
    if (existingItem) {
      if (existingItem.quantity + 1 > stock) {
        Alert.alert('Stock Limit Reached', `Only ${stock} unit(s) available.`);
        return;
      }
      newCart = cart.map(item => 
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1, price }
          : item
      );
    } else {
      if (stock < 1) {
        Alert.alert('Out of Stock', 'This product is currently out of stock.');
        return;
      }
      newCart = [...cart, { 
          cartItemId,
          product: product._id, 
          name: product.name, 
          price: price, 
          image: product.image,
          unit: unit,
          stock: stock,
          quantity: 1 
      }];
    }
    
    SecureStore.setItemAsync('rambazar_cart', JSON.stringify(newCart)).catch(()=>{});
    set({ cart: newCart });
  },

  removeFromCart: (cartItemId) => {
    const { cart } = get();
    const newCart = cart.filter(item => item.cartItemId !== cartItemId);
    SecureStore.setItemAsync('rambazar_cart', JSON.stringify(newCart)).catch(()=>{});
    set({ cart: newCart });
  },

  updateQuantity: (cartItemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    if (existingItem && quantity > existingItem.stock) {
      Alert.alert('Stock Limit Reached', `Only ${existingItem.stock} unit(s) available.`);
      return;
    }

    const newCart = cart.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    );
    SecureStore.setItemAsync('rambazar_cart', JSON.stringify(newCart)).catch(()=>{});
    set({ cart: newCart });
  },

  clearCart: () => {
    SecureStore.deleteItemAsync('rambazar_cart').catch(()=>{});
    set({ cart: [] });
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));

export default useCartStore;
