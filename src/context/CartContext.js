import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'component_search_cart';

const loadCart = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  const addToCart = useCallback((item) => {
    const current = loadCart();
    const existing = current.find((i) => i.partNumber === item.partNumber);
    let updated;
    if (existing) {
      updated = current.map((i) =>
        i.partNumber === item.partNumber
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      updated = [...current, { partNumber: item.partNumber, manufacturer: item.manufacturer, quantity: item.quantity }];
    }
    saveCart(updated);
    setCartItems(updated);
  }, []);

  const removeFromCart = useCallback((partNumber) => {
    const updated = loadCart().filter((i) => i.partNumber !== partNumber);
    saveCart(updated);
    setCartItems(updated);
  }, []);

  const updateQuantity = useCallback((partNumber, quantity) => {
    if (quantity < 1) return;
    const updated = loadCart().map((i) => (i.partNumber === partNumber ? { ...i, quantity } : i));
    saveCart(updated);
    setCartItems(updated);
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
    setCartItems([]);
  }, []);

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
