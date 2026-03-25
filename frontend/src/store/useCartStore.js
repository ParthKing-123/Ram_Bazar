import { create } from 'zustand';

const saveCart = (cart) => {
  try {
    localStorage.setItem('rambazar_cart', JSON.stringify(cart));
  } catch (e) {}
};

const loadCart = () => {
  try {
    const saved = localStorage.getItem('rambazar_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const useCartStore = create((set, get) => ({
  cart: loadCart(),
  addToCart: (product) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.product === product._id);
    let newCart;
    if (existingItem) {
      newCart = cart.map(item => 
        item.product === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { 
          product: product._id, 
          name: product.name, 
          price: product.price, 
          image: product.image,
          quantity: 1 
      }];
    }
    saveCart(newCart);
    set({ cart: newCart });
  },
  removeFromCart: (productId) => {
    const { cart } = get();
    const newCart = cart.filter(item => item.product !== productId);
    saveCart(newCart);
    set({ cart: newCart });
  },
  updateQuantity: (productId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.product === productId 
        ? { ...item, quantity }
        : item
    );
    saveCart(newCart);
    set({ cart: newCart });
  },
  clearCart: () => {
    saveCart([]);
    set({ cart: [] });
  },
  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));

export default useCartStore;
