import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ title: 'Chat' }} />
        <Stack.Screen name="chat-buyer" options={{ title: 'Chat (Acheteur)' }} />
        <Stack.Screen name="chat-seller" options={{ title: 'Chat (Vendeur)' }} />
        <Stack.Screen name="chat-header" options={{ title: 'Chat Header' }} />
        <Stack.Screen name="seed" options={{ title: 'Seed' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack>
    </ThemeProvider>
  );
}