import React, { createContext, useContext, useMemo, useState } from 'react';
import { MENU_ITEMS, PaymentMethod, ReceiptMethod, ServiceMode, TAX_RATE } from '@/lib/kinjo-data';

export interface CartItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface CompletedOrder {
  id: string;
  createdAtIso: string;
  serviceMode: ServiceMode;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  receiptMethod: ReceiptMethod;
  receiptContact: string;
}

interface OrderStoreValue {
  serviceMode: ServiceMode | null;
  setServiceMode: (mode: ServiceMode) => void;
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  totalBeforeTip: number;
  tipPercent: number;
  setTipPercent: (value: number) => void;
  tip: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  receiptMethod: ReceiptMethod;
  receiptContact: string;
  lastOrder: CompletedOrder | null;
  addToCart: (itemId: string) => void;
  addCustomItem: (item: Omit<CartItem, 'quantity'>) => void;
  setItemQuantity: (itemId: string, quantity: number) => void;
  changeItemQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  confirmPayment: () => CompletedOrder | null;
  applyReceipt: (method: ReceiptMethod, contact: string) => void;
  startNewOrder: () => void;
}

const OrderStore = createContext<OrderStoreValue | undefined>(undefined);
const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'card';

function generateOrderId(): string {
  return `KP-${Math.floor(Math.random() * 90000) + 10000}`;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [serviceMode, setServiceMode] = useState<ServiceMode | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [receiptMethod, setReceiptMethod] = useState<ReceiptMethod>('none');
  const [receiptContact, setReceiptContact] = useState('');
  const [lastOrder, setLastOrder] = useState<CompletedOrder | null>(null);

  const itemCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);
  const subtotal   = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const tax        = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const totalBeforeTip = useMemo(() => subtotal + tax, [subtotal, tax]);
  const tip        = useMemo(() => subtotal * (tipPercent / 100), [subtotal, tipPercent]);
  const grandTotal = useMemo(() => totalBeforeTip + tip, [totalBeforeTip, tip]);

  const addToCart = (itemId: string) => {
    const menuItem = MENU_ITEMS.find((e) => e.id === itemId);
    if (!menuItem) return;
    setCart((c) => {
      const existing = c.find((e) => e.id === itemId);
      if (!existing) return [...c, { ...menuItem, quantity: 1 }];
      return c.map((e) => e.id === itemId ? { ...e, quantity: e.quantity + 1 } : e);
    });
  };

  const addCustomItem = (item: Omit<CartItem, 'quantity'>) => {
    setCart((c) => [...c, { ...item, quantity: 1 }]);
  };

  const setItemQuantity = (itemId: string, quantity: number) => {
    setCart((c) => c.map((e) => e.id === itemId ? { ...e, quantity } : e).filter((e) => e.quantity > 0));
  };

  const changeItemQuantity = (itemId: string, delta: number) => {
    setCart((c) => c.map((e) => e.id === itemId ? { ...e, quantity: e.quantity + delta } : e).filter((e) => e.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const confirmPayment = () => {
    if (!serviceMode || cart.length === 0) return null;
    const order: CompletedOrder = {
      id: generateOrderId(),
      createdAtIso: new Date().toISOString(),
      serviceMode, paymentMethod,
      items: cart.map((i) => ({ ...i })),
      subtotal, tax, tip, total: grandTotal,
      receiptMethod, receiptContact,
    };
    setLastOrder(order);
    setCart([]);
    return order;
  };

  const applyReceipt = (method: ReceiptMethod, contact: string) => {
    const clean = contact.trim();
    setReceiptMethod(method);
    setReceiptContact(clean);
    setLastOrder((o) => o ? { ...o, receiptMethod: method, receiptContact: clean } : o);
  };

  const startNewOrder = () => {
    setServiceMode(null); setCart([]); setPaymentMethod(DEFAULT_PAYMENT_METHOD);
    setTipPercent(0); setReceiptMethod('none'); setReceiptContact(''); setLastOrder(null);
  };

  const value: OrderStoreValue = useMemo(() => ({
    serviceMode, setServiceMode, cart, itemCount, subtotal, tax, totalBeforeTip,
    tipPercent, setTipPercent, tip, grandTotal, paymentMethod, setPaymentMethod,
    receiptMethod, receiptContact, lastOrder,
    addToCart, addCustomItem, setItemQuantity, changeItemQuantity,
    clearCart, confirmPayment, applyReceipt, startNewOrder,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [serviceMode, cart, itemCount, subtotal, tax, totalBeforeTip, tipPercent, tip, grandTotal, paymentMethod, receiptMethod, receiptContact, lastOrder]);

  return <OrderStore.Provider value={value}>{children}</OrderStore.Provider>;
}

export function useOrderStore() {
  const ctx = useContext(OrderStore);
  if (!ctx) throw new Error('useOrderStore must be used inside OrderProvider');
  return ctx;
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatServiceMode(mode: ServiceMode | null): string {
  if (mode === 'eat-here') return 'Comer Aqui';
  if (mode === 'to-go') return 'Para Viagem';
  return 'Não Selecionado';
}

export function formatPaymentMethod(method: PaymentMethod): string {
  if (method === 'apple-pay') return 'Apple/Google Pay';
  if (method === 'cash') return 'Dinheiro';
  return 'Cartão';
}
