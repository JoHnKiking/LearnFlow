import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="story" />
        <Stack.Screen name="monster-selection" />
        <Stack.Screen name="module-selection" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="skill-tree" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}