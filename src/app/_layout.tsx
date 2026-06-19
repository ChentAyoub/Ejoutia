import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1A1A2E',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitle: 'Retour',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat"
          options={{
            title: 'Chat',
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
        <Stack.Screen
          name="chat-buyer"
          options={{
            title: '',
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
        <Stack.Screen
          name="chat-seller"
          options={{
            title: '',
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
        <Stack.Screen name="chat-header" options={{ title: 'Chat Header' }} />
        <Stack.Screen name="seed" options={{ title: 'Seed Data' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack>
    </ThemeProvider>
  );
}