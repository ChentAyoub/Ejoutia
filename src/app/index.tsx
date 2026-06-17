// src/app/index.tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

// Seeded conversations (fake data for now — we'll wire to Firestore later)
const CONVERSATIONS = [
  {
    id: "1",
    name: "Charles Dean",
    avatar: "https://i.pravatar.cc/150?img=12",
    itemPhoto: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200",
    itemName: "Cabin House",
    lastMessage: "Oui, toujours disponible !",
    time: "12:40",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Sarah Lemna",
    avatar: "https://i.pravatar.cc/150?img=45",
    itemPhoto: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
    itemName: "Nike Air Max",
    lastMessage: "Je peux faire 100 DH ?",
    time: "11:05",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Martin Luther",
    avatar: "https://i.pravatar.cc/150?img=33",
    itemPhoto: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
    itemName: "Montre vintage",
    lastMessage: "Merci, à bientôt.",
    time: "Hier",
    unread: 0,
    online: false,
  },
];

export default function Inbox() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => router.push("/chat")}>
            {/* Avatar with online dot */}
            <View>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>

            {/* Name + last message */}
            <View style={styles.middle}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.itemName}>📦 {item.itemName}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
            </View>

            {/* Item photo + time + unread */}
            <View style={styles.right}>
              <Image source={{ uri: item.itemPhoto }} style={styles.itemPhoto} />
              <Text style={styles.time}>{item.time}</Text>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 26, fontWeight: "800", padding: 16, paddingBottom: 8 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#eee" },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#4caf50", borderWidth: 2, borderColor: "#fff",
  },
  middle: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "700", color: "#222" },
  itemName: { fontSize: 12, color: "#ff6f00", marginTop: 1 },
  lastMsg: { fontSize: 14, color: "#777", marginTop: 2 },
  right: { alignItems: "flex-end" },
  itemPhoto: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#eee", marginBottom: 4 },
  time: { fontSize: 11, color: "#999" },
  badge: {
    backgroundColor: "#ff6f00", borderRadius: 10, minWidth: 20, height: 20,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 5, marginTop: 2,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});