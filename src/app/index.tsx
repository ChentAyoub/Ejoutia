// src/app/index.tsx
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Inbox() {
  const router = useRouter();
  const [convos, setConvos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "conversations"), orderBy("lastTime", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setConvos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={convos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/chat-buyer?conversationId=${item.id}`)}
          >
            <View>
              <Image source={{ uri: item.sellerAvatar }} style={styles.avatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.middle}>
              <Text style={styles.name}>{item.sellerName}</Text>
              <Text style={styles.itemName}>📦 {item.itemTitle}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <View style={styles.right}>
              <Image source={{ uri: item.itemPhoto }} style={styles.itemPhoto} />
              {item.unread > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 26, fontWeight: "800", padding: 16, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#eee" },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#4caf50", borderWidth: 2, borderColor: "#fff" },
  middle: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "700", color: "#222" },
  itemName: { fontSize: 12, color: "#ff6f00", marginTop: 1 },
  lastMsg: { fontSize: 14, color: "#777", marginTop: 2 },
  right: { alignItems: "flex-end" },
  itemPhoto: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#eee", marginBottom: 4 },
  badge: { backgroundColor: "#ff6f00", borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});