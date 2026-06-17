// src/app/chat.tsx
import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const BUYER = { _id: "buyer", name: "Acheteur" };
const SELLER = { _id: "seller", name: "Vendeur" };

export default function Chat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isBuyer, setIsBuyer] = useState(true);

  const currentUser = isBuyer ? BUYER : SELLER;

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          user: data.user,
        } as IMessage;
      });
      setMessages(loaded);
    });
    return unsubscribe;
  }, []);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const msg = newMessages[0];
      await addDoc(collection(db, "messages"), {
        text: msg.text,
        createdAt: new Date(),
        user: currentUser,
      });
    },
    [currentUser]
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleBar}>
        <Text style={styles.toggleLabel}>Sending as:</Text>
        <TouchableOpacity
          style={[styles.toggleBtn, isBuyer && styles.toggleActive]}
          onPress={() => setIsBuyer(true)}
        >
          <Text style={[styles.toggleText, isBuyer && styles.toggleTextActive]}>
            Acheteur
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, !isBuyer && styles.toggleActive]}
          onPress={() => setIsBuyer(false)}
        >
          <Text style={[styles.toggleText, !isBuyer && styles.toggleTextActive]}>
            Vendeur
          </Text>
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={currentUser}
        textInputProps={{ placeholder: "Écrire un message..." }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toggleBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  toggleLabel: { marginRight: 10, color: "#555", fontSize: 13 },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#e0e0e0",
  },
  toggleActive: { backgroundColor: "#2e7d32" },
  toggleText: { color: "#555", fontWeight: "500" },
  toggleTextActive: { color: "#fff" },
});