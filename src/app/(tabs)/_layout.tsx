import { Tabs } from "expo-router";
import { Brand } from "../../constants/theme";
import { Platform, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function TabLayout() {
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for unread conversations to update the badge
  useEffect(() => {
    const q = query(collection(db, "conversations"));
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        // Assuming we are the buyer for the prototype global badge
        if (data.unreadBuyer > 0) {
          count += data.unreadBuyer;
        }
      });
      setUnreadCount(count);
    });
    return unsub;
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Brand.surface, // #1E1E1E
          borderTopWidth: 1,
          borderTopColor: Brand.surfaceLight, // #2A2A2A
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          height: Platform.OS === "ios" ? 88 : 68,
          elevation: 0, // Remove android shadow to keep it flat and clean
        },
        tabBarActiveTintColor: Brand.primary, // #ff6f00
        tabBarInactiveTintColor: Brand.subText, // #999999
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && (
                <View style={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255, 111, 0, 0.1)', borderRadius: 20 }} />
              )}
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Brand.primary,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && (
                <View style={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255, 111, 0, 0.1)', borderRadius: 20 }} />
              )}
              <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {focused && (
                <View style={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255, 111, 0, 0.1)', borderRadius: 20 }} />
              )}
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
