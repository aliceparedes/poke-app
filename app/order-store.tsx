import { Redirect } from 'expo-router';

// This is not a screen — the real module lives in lib/order-store.tsx
export default function OrderStoreRoute() {
  return <Redirect href="/" />;
}

export * from '@/lib/order-store';
