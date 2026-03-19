import { Stack } from 'expo-router';

export default function KioskFlowLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="custom-bowl" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="pos" />
      <Stack.Screen name="receipt" />
    </Stack>
  );
}