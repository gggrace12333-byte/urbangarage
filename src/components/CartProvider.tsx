'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';
import CartDrawer from '@/components/CartDrawer';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, sku?: { name?: string; value?: string; price?: number; compare_at_price?: number | null; images?: string[] }) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
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

  const addItem = useCallback((product: Product, quantity = 1, sku?: any) => {
    setItems(prev => {
      const skuKey = sku?.value || sku?.name || '';
      const exIdx = prev.findIndex(i => i.product.id === product.id && (i.sku_value || '') === skuKey);
      if (exIdx >= 0) return prev.map((i, idx) => idx === exIdx ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity, sku_name: sku?.name, sku_value: sku?.value, sku_price: sku?.price, sku_compare_at_price: sku?.compare_at_price, sku_images: sku?.images }];
    });
    trackAnalytics('add_to_cart', quantity);
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((index: number) => setItems(p => p.filter((_, i) => i !== index)), []);
  const updateQuantity = useCallback((index: number, qty: number) => {
    if (qty <= 0) { setItems(p => p.filter((_, i) => i !== index)); return; }
    setItems(p => p.map((i, idx) => idx === index ? { ...i, quantity: qty } : i));
  }, []);
  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setDrawerOpen(true), []);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.sku_price || i.product.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, openCart }}>
      {children}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </CartContext.Provider>
  );
}

export function useCart() { const ctx = useContext(CartContext); if (!ctx) throw new Error('useCart outside provider'); return ctx; }
