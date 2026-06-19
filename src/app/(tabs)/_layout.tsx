import { Tabs } from "expo-router";
import { Brand } from "../../constants/theme";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Brand.bgDark,
          borderTopWidth: 1,
          borderTopColor: Brand.surface,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarActiveTintColor: Brand.primary,
        tabBarInactiveTintColor: Brand.subText,
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>🏠</span>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>💬</span>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <span style={{ color, fontSize: size }}>👤</span>
          ),
        }}
      />
    </Tabs>
  );
}
