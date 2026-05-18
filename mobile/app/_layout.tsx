import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';

function AppContent() {
  const { isDark } = useTheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="story" />
        <Stack.Screen name="monster-selection" />
        <Stack.Screen name="module-selection" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="skill-tree" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
