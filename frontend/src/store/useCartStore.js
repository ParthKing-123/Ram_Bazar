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
  addToCart: (product, variant = null) => {
    const { cart } = get();
    const unit = variant ? variant.unit : (product.unit || '1 Piece');
    const price = variant ? variant.price : product.price;
    const cartItemId = `${product._id}_${unit}`;

    const existingItem = cart.find(item => 
      item.cartItemId === cartItemId || 
      (item.product === product._id && item.unit === unit) || 
      (!item.cartItemId && item.product === product._id && !variant)
    );
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item => 
        (item.cartItemId === cartItemId || item === existingItem)
          ? { ...item, quantity: item.quantity + 1, cartItemId, unit, price }
          : item
      );
    } else {
      newCart = [...cart, { 
          cartItemId,
          product: product._id, 
          name: product.name, 
          price: price, 
          image: product.image,
          unit: unit,
          quantity: 1 
      }];
    }
    saveCart(newCart);
    set({ cart: newCart });
  },
  removeFromCart: (cartItemId) => {
    const { cart } = get();
    const newCart = cart.filter(item => item.cartItemId ? item.cartItemId !== cartItemId : item.product !== cartItemId);
    saveCart(newCart);
    set({ cart: newCart });
  },
  updateQuantity: (cartItemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    const newCart = cart.map(item => 
      (item.cartItemId === cartItemId || item.product === cartItemId)
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
