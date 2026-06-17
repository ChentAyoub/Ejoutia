// src/app/seed.tsx — TEMPORARY, delete after seeding
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Seed() {
  const seed = async () => {
    try {
      // Users
      await setDoc(doc(db, "users", "seller_doha"), {
        name: "Doha", avatar: "https://i.pravatar.cc/150?img=12",
        rating: 4.8, totalSales: 47, memberSince: 2020, verified: true,
      });
      await setDoc(doc(db, "users", "buyer_ayoub"), {
        name: "Ayoub", avatar: "https://i.pravatar.cc/150?img=8",
        rating: 4.5, totalPurchases: 12, memberSince: 2021, verified: true,
      });

      // Listings
      await setDoc(doc(db, "listings", "item_1"), {
        title: "Cabin House", price: 150, priceFirm: true,
        photo: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
        sellerId: "seller_doha",
      });
      await setDoc(doc(db, "listings", "item_2"), {
        title: "Nike Air Max", price: 120, priceFirm: false,
        photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        sellerId: "seller_doha",
      });
      await setDoc(doc(db, "listings", "item_3"), {
        title: "Montre vintage", price: 300, priceFirm: false,
        photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        sellerId: "seller_doha",
      });

      // Conversations
      await setDoc(doc(db, "conversations", "conv_1"), {
        listingId: "item_1", sellerId: "seller_doha", buyerId: "buyer_ayoub",
        lastMessage: "Oui, toujours disponible !", lastTime: new Date(),
        buyerName: "Ayoub", buyerAvatar: "https://i.pravatar.cc/150?img=8",
        sellerName: "Doha", sellerAvatar: "https://i.pravatar.cc/150?img=12",
        itemTitle: "Cabin House",
        itemPhoto: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200",
        unread: 2, online: true,
      });
      await setDoc(doc(db, "conversations", "conv_2"), {
        listingId: "item_2", sellerId: "seller_doha", buyerId: "buyer_ayoub",
        lastMessage: "Je peux faire 100 DH ?", lastTime: new Date(),
        buyerName: "Ayoub", buyerAvatar: "https://i.pravatar.cc/150?img=8",
        sellerName: "Doha", sellerAvatar: "https://i.pravatar.cc/150?img=12",
        itemTitle: "Nike Air Max",
        itemPhoto: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
        unread: 0, online: true,
      });
      await setDoc(doc(db, "conversations", "conv_3"), {
        listingId: "item_3", sellerId: "seller_doha", buyerId: "buyer_ayoub",
        lastMessage: "Merci, à bientôt.", lastTime: new Date(),
        buyerName: "Ayoub", buyerAvatar: "https://i.pravatar.cc/150?img=8",
        sellerName: "Doha", sellerAvatar: "https://i.pravatar.cc/150?img=12",
        itemTitle: "Montre vintage",
        itemPhoto: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
        unread: 0, online: false,
      });

      Alert.alert("Done", "Users, listings & conversations written!");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={styles.c}>
      <Text style={styles.t}>Seed Firestore</Text>
      <Button title="Seed sample data" onPress={seed} />
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: "center", alignItems: "center" },
  t: { fontSize: 18, marginBottom: 16 },
});