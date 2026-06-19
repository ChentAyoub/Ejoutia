import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#F5F5F5',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitle: 'Retour',
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat"
          options={{
            title: 'Chat',
          }}
        />
        <Stack.Screen
          name="chat-buyer"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="chat-seller"
          options={{
            title: '',
          }}
        />
        <Stack.Screen name="chat-header" options={{ title: 'Chat Header' }} />
        <Stack.Screen name="seed" options={{ title: 'Seed Data' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack>
    </ThemeProvider>
  );
}