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

// Normalise a price break list to the { min_qty, price } shape used by the
// cart/order backends. Returns an empty array for invalid input.
const normalizePriceBreaks = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .map((pb) => {
      const minQty = Number(pb?.min_qty ?? pb?.break_qty);
      const price = Number(pb?.price);
      if (!Number.isFinite(minQty) || minQty < 1) return null;
      if (!Number.isFinite(price) || price <= 0) return null;
      return { min_qty: minQty, price };
    })
    .filter(Boolean);

// Given price breaks and a quantity, return the unit price for the highest
// min_qty that is <= qty. Returns null when no break qualifies.
export const computeUnitPriceForQty = (priceBreaks, qty) => {
  const n = Number(qty);
  if (!Number.isFinite(n) || n < 1) return null;
  const breaks = normalizePriceBreaks(priceBreaks);
  if (breaks.length === 0) return null;
  const eligible = breaks
    .filter((pb) => pb.min_qty <= n)
    .sort((a, b) => b.min_qty - a.min_qty);
  return eligible.length > 0 ? eligible[0].price : null;
};

// The backend uses snake_case (part_number). The frontend historically uses
// camelCase (partNumber). These helpers keep the two worlds in sync.
const fromServerItem = (it) => {
  const out = {
    partNumber: it.part_number || it.partNumber,
    manufacturer: it.manufacturer || '',
    quantity: Number(it.quantity) || 1,
  };
  const unitPrice = it.unit_price != null ? Number(it.unit_price) : null;
  if (unitPrice != null && Number.isFinite(unitPrice)) {
    out.unit_price = unitPrice;
  }
  const priceBreaks = normalizePriceBreaks(it.price_breaks);
  if (priceBreaks.length > 0) {
    out.price_breaks = priceBreaks;
  }
  return out;
};

const toServerItem = (it) => {
  const out = {
    part_number: it.partNumber,
    manufacturer: it.manufacturer || '',
    quantity: Number(it.quantity) || 1,
  };
  if (it.unit_price != null && Number.isFinite(Number(it.unit_price))) {
    out.unit_price = Number(it.unit_price);
  }
  const priceBreaks = normalizePriceBreaks(it.price_breaks);
  if (priceBreaks.length > 0) {
    out.price_breaks = priceBreaks;
  }
  return out;
};

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
    const incomingPriceBreaks = normalizePriceBreaks(item.price_breaks);
    const mergedItem = existing
      ? (() => {
          const newQty = existing.quantity + item.quantity;
          // Prefer the freshly-provided price_breaks (the caller just fetched
          // them from the part detail page); fall back to what we had.
          const breaks = incomingPriceBreaks.length > 0
            ? incomingPriceBreaks
            : (existing.price_breaks || []);
          const recomputed = computeUnitPriceForQty(breaks, newQty);
          const next = { ...existing, quantity: newQty };
          // If we can compute an updated price, prefer it; otherwise keep
          // whatever unit_price was on the incoming or existing item.
          const nextUnitPrice = recomputed != null
            ? recomputed
            : (item.unit_price != null ? Number(item.unit_price) : existing.unit_price);
          if (nextUnitPrice != null && Number.isFinite(Number(nextUnitPrice))) {
            next.unit_price = Number(nextUnitPrice);
          }
          if (breaks.length > 0) {
            next.price_breaks = breaks;
          }
          return next;
        })()
      : (() => {
          const next = {
            partNumber: item.partNumber,
            manufacturer: item.manufacturer,
            quantity: item.quantity,
          };
          if (item.unit_price != null && Number.isFinite(Number(item.unit_price))) {
            next.unit_price = Number(item.unit_price);
          }
          if (incomingPriceBreaks.length > 0) {
            next.price_breaks = incomingPriceBreaks;
          }
          return next;
        })();
    const updated = existing
      ? current.map((i) => (i.partNumber === item.partNumber ? mergedItem : i))
      : [...current, mergedItem];
    persist(updated);
    try {
      await apiService.addCartItem(toServerItem(mergedItem));
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
    // When we have price_breaks stored alongside the item, recompute the
    // unit price for the new quantity so subtotals in the cart stay accurate.
    const updated = loadCart().map((i) => {
      if (i.partNumber !== partNumber) return i;
      const next = { ...i, quantity };
      if (i.price_breaks && i.price_breaks.length > 0) {
        const recomputed = computeUnitPriceForQty(i.price_breaks, quantity);
        if (recomputed != null) next.unit_price = recomputed;
      }
      return next;
    });
    persist(updated);
    try {
      // Send the full item so unit_price/price_breaks stay in sync server-side.
      const updatedItem = updated.find((i) => i.partNumber === partNumber);
      if (updatedItem) {
        await apiService.putCart(updated.map(toServerItem));
      } else {
        await apiService.updateCartItem(partNumber, quantity);
      }
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
