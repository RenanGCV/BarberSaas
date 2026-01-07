import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a1a' },
      }}
    >
      <Stack.Screen name="barbershop/[id]" />
      <Stack.Screen name="select-service" />
      <Stack.Screen name="select-time" />
      <Stack.Screen name="guest-info" />
    </Stack>
  );
}
