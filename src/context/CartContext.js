import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService, getOrCreateSessionId } from '../services/userManagementService';
import { useAuth } from './AuthContext';

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
};

// The backend uses snake_case (part_number). The frontend historically uses
// camelCase (partNumber). These helpers keep the two worlds in sync.
const fromServerItem = (it) => ({
  partNumber: it.part_number || it.partNumber,
  manufacturer: it.manufacturer || '',
  quantity: Number(it.quantity) || 1,
});

const toServerItem = (it) => ({
  part_number: it.partNumber,
  manufacturer: it.manufacturer || '',
  quantity: Number(it.quantity) || 1,
});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(loadCart);
  const [syncing, setSyncing] = useState(false);
  const mountedRef = useRef(false);
  const lastUserIdRef = useRef(user ? (user.user_id || user.username) : null);

  // --- Local cache helpers --------------------------------------------------
  const persist = useCallback((items) => {
    saveCart(items);
    setCartItems(items);
  }, []);

  // --- Initial load: server is source of truth, local cache mirrors it. ----
  // We intentionally do NOT merge local + remote here — local is only a
  // mirror of the last known server state, so merging would double-count
  // items on every reload. If the server call fails, we fall back to the
  // local cache so the UI still renders something.
  useEffect(() => {
    let cancelled = false;

    const loadFromServer = async () => {
      setSyncing(true);
      try {
        const resp = await apiService.getCart();
        const remote = (resp.data?.cart?.items || []).map(fromServerItem);
        if (!cancelled) {
          persist(remote);
        }
      } catch (err) {
        console.warn('Cart load failed, keeping local cache:', err?.message || err);
      } finally {
        if (!cancelled) setSyncing(false);
        mountedRef.current = true;
      }
    };

    loadFromServer();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  // --- Mutations (optimistic local update, then background sync) -----------
  const addToCart = useCallback(async (item) => {
    const current = loadCart();
    const existing = current.find((i) => i.partNumber === item.partNumber);
    const updated = existing
      ? current.map((i) =>
          i.partNumber === item.partNumber
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        )
      : [...current, {
          partNumber: item.partNumber,
          manufacturer: item.manufacturer,
          quantity: item.quantity,
        }];
    persist(updated);
    try {
      await apiService.addCartItem(toServerItem(item));
    } catch (err) {
      console.warn('addCartItem sync failed:', err?.message || err);
    }
  }, [persist]);

  const removeFromCart = useCallback(async (partNumber) => {
    const updated = loadCart().filter((i) => i.partNumber !== partNumber);
    persist(updated);
    try {
      await apiService.removeCartItem(partNumber);
    } catch (err) {
      console.warn('removeCartItem sync failed:', err?.message || err);
    }
  }, [persist]);

  const updateQuantity = useCallback(async (partNumber, quantity) => {
    if (quantity < 1) return;
    const updated = loadCart().map((i) =>
      i.partNumber === partNumber ? { ...i, quantity } : i,
    );
    persist(updated);
    try {
      await apiService.updateCartItem(partNumber, quantity);
    } catch (err) {
      console.warn('updateCartItem sync failed:', err?.message || err);
    }
  }, [persist]);

  const clearCart = useCallback(async () => {
    persist([]);
    try {
      await apiService.clearRemoteCart();
    } catch (err) {
      console.warn('clearRemoteCart sync failed:', err?.message || err);
    }
  }, [persist]);

  // Called by AuthContext immediately after a successful login so the
  // anonymous session cart is merged into the authenticated user's cart.
  const mergeSessionCartIntoUserCart = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      await apiService.mergeCart(sessionId);
      const resp = await apiService.getCart();
      const merged = (resp.data?.cart?.items || []).map(fromServerItem);
      persist(merged);
    } catch (err) {
      console.warn('mergeSessionCartIntoUserCart failed:', err?.message || err);
    }
  }, [persist]);

  // Called by AuthContext on logout: reset local cart since the user's cart
  // is server-owned and an anonymous session cart should start empty.
  const resetLocalCart = useCallback(() => {
    persist([]);
  }, [persist]);

  // Watch for login/logout transitions and reconcile the cart accordingly.
  useEffect(() => {
    const currentId = user ? (user.user_id || user.username) : null;
    const prevId = lastUserIdRef.current;
    if (!mountedRef.current) {
      lastUserIdRef.current = currentId;
      return;
    }
    if (!prevId && currentId) {
      // Anonymous -> authenticated: merge session cart into user cart
      mergeSessionCartIntoUserCart();
    } else if (prevId && !currentId) {
      // Authenticated -> anonymous: clear local cache; new session cart starts empty
      resetLocalCart();
    }
    lastUserIdRef.current = currentId;
  }, [user, mergeSessionCartIntoUserCart, resetLocalCart]);

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        syncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        mergeSessionCartIntoUserCart,
        resetLocalCart,
      }}
    >
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
