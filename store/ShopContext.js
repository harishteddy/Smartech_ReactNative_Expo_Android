import React, { createContext, useContext, useState } from 'react';

export const ALL_PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', category: 'Electronics', brand: 'SoundMax', price: 2999, rating: 4.5, image: '🎧', description: 'Premium noise-cancelling wireless headphones with 30hr battery.' },
  { id: '2', name: 'Smart Watch', category: 'Electronics', brand: 'TechGear', price: 4999, rating: 4.3, image: '⌚', description: 'Track fitness, notifications and more from your wrist.' },
  { id: '3', name: 'Running Shoes', category: 'Fashion', brand: 'SpeedRun', price: 1499, rating: 4.7, image: '👟', description: 'Lightweight running shoes with advanced cushioning.' },
  { id: '4', name: 'Coffee Maker', category: 'Home', brand: 'BrewMaster', price: 3499, rating: 4.2, image: '☕', description: 'Brew the perfect cup every morning with programmable settings.' },
  { id: '5', name: 'Yoga Mat', category: 'Sports', brand: 'FlexFit', price: 799, rating: 4.6, image: '🧘', description: 'Non-slip premium yoga mat with alignment lines.' },
  { id: '6', name: 'Backpack', category: 'Fashion', brand: 'TravelPro', price: 1299, rating: 4.4, image: '🎒', description: 'Waterproof backpack with USB charging port and laptop sleeve.' },
  { id: '7', name: 'Bluetooth Speaker', category: 'Electronics', brand: 'SoundMax', price: 1999, rating: 4.5, image: '🔊', description: '360° surround sound with 20hr playtime and waterproof design.' },
  { id: '8', name: 'Air Purifier', category: 'Home', brand: 'PureAir', price: 5999, rating: 4.1, image: '💨', description: 'HEPA filter removes 99.9% of allergens and pollutants.' },
  { id: '9', name: 'Resistance Bands', category: 'Sports', brand: 'FlexFit', price: 499, rating: 4.8, image: '💪', description: 'Set of 5 bands for full body workout at home or gym.' },
  { id: '10', name: 'Sunglasses', category: 'Fashion', brand: 'ShadeStyle', price: 899, rating: 4.3, image: '🕶️', description: 'UV400 polarized lenses in a premium acetate frame.' },
];

export const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports'];

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const addToWishlist = (product) => {
    setWishlist(prev => prev.find(i => i.id === product.id) ? prev.filter(i => i.id !== product.id) : [...prev, product]);
  };

  const isInWishlist = (id) => wishlist.some(i => i.id === id);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const wishlistCount = wishlist.length;

  const clearCart = () => setCart([]);

  return (
    <ShopContext.Provider value={{ cart, wishlist, cartCount, cartTotal, wishlistCount, addToCart, removeFromCart, updateQty, addToWishlist, isInWishlist, clearCart }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
