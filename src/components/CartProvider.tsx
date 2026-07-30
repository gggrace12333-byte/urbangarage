'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';
import CartDrawer from '@/components/CartDrawer';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function trackAnalytics(event: string, value = 1) {
  fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, value }) }).catch(() => {});
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { try { const s = localStorage.getItem('ug-cart'); if (s) setItems(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { localStorage.setItem('ug-cart', JSON.stringify(items)); }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
    trackAnalytics('add_to_cart', quantity);
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((pid: number) => setItems(p => p.filter(i => i.product.id !== pid)), []);
  const updateQuantity = useCallback((pid: number, qty: number) => {
    if (qty <= 0) { setItems(p => p.filter(i => i.product.id !== pid)); return; }
    setItems(p => p.map(i => i.product.id === pid ? { ...i, quantity: qty } : i));
  }, []);
  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setDrawerOpen(true), []);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, openCart }}>
      {children}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </CartContext.Provider>
  );
}

export function useCart() { const ctx = useContext(CartContext); if (!ctx) throw new Error('useCart outside provider'); return ctx; }
