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

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.partNumber === item.partNumber);
      if (existing) {
        return prev.map((i) =>
          i.partNumber === item.partNumber
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { partNumber: item.partNumber, manufacturer: item.manufacturer, quantity: item.quantity }];
    });
  }, []);

  const removeFromCart = useCallback((partNumber) => {
    setCartItems((prev) => prev.filter((i) => i.partNumber !== partNumber));
  }, []);

  const updateQuantity = useCallback((partNumber, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.partNumber === partNumber ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
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
