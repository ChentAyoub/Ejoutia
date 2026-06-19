import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { doc, setDoc, collection, addDoc, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebaseConfig";
import { Brand, Radius, Shadow } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

// ─── Dummy Data Generators ───

const USERS = [
  { id: "seller_doha", name: "Doha", avatar: "https://i.pravatar.cc/150?img=12", rating: 4.8, totalSales: 47, memberSince: 2020, verified: true },
  { id: "buyer_ayoub", name: "Ayoub", avatar: "https://i.pravatar.cc/150?img=8", rating: 4.5, totalPurchases: 12, memberSince: 2021, verified: true },
  { id: "seller_youssef", name: "Youssef", avatar: "https://i.pravatar.cc/150?img=11", rating: 4.9, totalSales: 120, memberSince: 2019, verified: true },
  { id: "buyer_sarah", name: "Sarah", avatar: "https://i.pravatar.cc/150?img=5", rating: 5.0, totalPurchases: 3, memberSince: 2023, verified: false },
  { id: "seller_mehdi", name: "Mehdi", avatar: "https://i.pravatar.cc/150?img=33", rating: 4.2, totalSales: 15, memberSince: 2022, verified: false },
  { id: "buyer_rim", name: "Rim", avatar: "https://i.pravatar.cc/150?img=47", rating: 4.7, totalPurchases: 22, memberSince: 2020, verified: true },
  { id: "seller_khalil", name: "Khalil", avatar: "https://i.pravatar.cc/150?img=53", rating: 4.6, totalSales: 88, memberSince: 2018, verified: true },
  { id: "buyer_leila", name: "Leila", avatar: "https://i.pravatar.cc/150?img=44", rating: 4.4, totalPurchases: 7, memberSince: 2022, verified: false },
];

const LISTINGS = [
  { id: "item_1", title: "Cabin House", price: 1500, priceFirm: true, photo: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400", sellerId: "seller_doha" },
  { id: "item_2", title: "Nike Air Max", price: 450, priceFirm: false, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", sellerId: "seller_youssef" },
  { id: "item_3", title: "Montre vintage", price: 1200, priceFirm: false, photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", sellerId: "seller_mehdi" },
  { id: "item_4", title: "MacBook Pro M1", price: 9500, priceFirm: true, photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", sellerId: "seller_khalil" },
  { id: "item_5", title: "Appareil Photo Sony", price: 3200, priceFirm: false, photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", sellerId: "seller_youssef" },
  { id: "item_6", title: "Canapé en cuir", price: 2500, priceFirm: false, photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sellerId: "seller_doha" },
  { id: "item_7", title: "Velo VTT", price: 800, priceFirm: true, photo: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", sellerId: "seller_khalil" },
];

const CONVERSATIONS = [
  { id: "conv_1", listingId: "item_1", sellerId: "seller_doha", buyerId: "buyer_ayoub", unread: 2, online: true, messages: [
    { text: "Bonjour, est-ce toujours dispo ?", type: "text", isSeller: false, offsetMin: 120 },
    { text: "Oui, toujours disponible !", type: "text", isSeller: true, offsetMin: 110 },
    { type: "audio", isSeller: false, audioDuration: 15, offsetMin: 105 },
    { text: "D'accord, je vous écoute.", type: "text", isSeller: true, offsetMin: 100 },
  ]},
  { id: "conv_2", listingId: "item_2", sellerId: "seller_youssef", buyerId: "buyer_sarah", unread: 0, online: false, messages: [
    { text: "Je peux faire 400 DH ?", type: "text", isSeller: false, offsetMin: 2880 }, // 2 days ago
    { type: "offer", amount: 400, status: "refused", isSeller: false, offsetMin: 2875 },
    { text: "Le prix est ferme à 450 DH désolé.", type: "text", isSeller: true, offsetMin: 2800 },
  ]},
  { id: "conv_3", listingId: "item_3", sellerId: "seller_mehdi", buyerId: "buyer_rim", unread: 1, online: true, messages: [
    { text: "La montre est-elle authentique ?", type: "text", isSeller: false, offsetMin: 60 },
    { text: "Oui bien sûr, avec facture.", type: "text", isSeller: true, offsetMin: 55 },
    { text: "Parfait, où peut-on se voir ?", type: "text", isSeller: false, offsetMin: 2 },
  ]},
  { id: "conv_4", listingId: "item_4", sellerId: "seller_khalil", buyerId: "buyer_leila", unread: 0, online: true, messages: [
    { text: "Quel est l'état de la batterie ?", type: "text", isSeller: false, offsetMin: 15 },
    { text: "95% de capacité maximale.", type: "text", isSeller: true, offsetMin: 12 },
    { text: "Top. Je réfléchis.", type: "text", isSeller: false, offsetMin: 5 },
  ]},
  { id: "conv_5", listingId: "item_5", sellerId: "seller_youssef", buyerId: "buyer_ayoub", unread: 5, online: false, messages: [
    { text: "L'objectif est inclus ?", type: "text", isSeller: false, offsetMin: 500 },
    { text: "Oui, le 50mm f/1.8", type: "text", isSeller: true, offsetMin: 490 },
    { text: "Très bien", type: "text", isSeller: false, offsetMin: 480 },
    { type: "offer", amount: 3000, status: "pending", isSeller: false, offsetMin: 475 },
    { text: "Vous acceptez 3000 DH ce soir ?", type: "text", isSeller: false, offsetMin: 470 },
  ]},
  { id: "conv_6", listingId: "item_6", sellerId: "seller_doha", buyerId: "buyer_rim", unread: 0, online: true, messages: [
    { text: "Il y a des rayures ?", type: "text", isSeller: false, offsetMin: 1440 }, // 1 day ago
    { text: "Très peu, il est en excellent état.", type: "text", isSeller: true, offsetMin: 1400 },
    { text: "D'accord merci.", type: "text", isSeller: false, offsetMin: 1390 },
  ]},
  { id: "conv_7", listingId: "item_7", sellerId: "seller_khalil", buyerId: "buyer_sarah", unread: 0, online: false, messages: [
    { text: "Taille du cadre ?", type: "text", isSeller: false, offsetMin: 4320 }, // 3 days ago
    { text: "C'est un L.", type: "text", isSeller: true, offsetMin: 4300 },
  ]},
];

export default function Seed() {
  const [status, setStatus] = useState("En attente de démarrage...");
  const [loading, setLoading] = useState(false);

  const performSeed = async () => {
    setLoading(true);
    try {
      setStatus("1/4: Création des utilisateurs...");
      const batch1 = writeBatch(db);
      USERS.forEach(u => {
        const { id, ...data } = u;
        batch1.set(doc(db, "users", id), data);
      });
      await batch1.commit();

      setStatus("2/4: Création des annonces...");
      const batch2 = writeBatch(db);
      LISTINGS.forEach(l => {
        const { id, ...data } = l;
        batch2.set(doc(db, "listings", id), data);
      });
      await batch2.commit();

      setStatus("3/4: Création des conversations et messages...");
      
      for (const conv of CONVERSATIONS) {
        const seller = USERS.find(u => u.id === conv.sellerId)!;
        const buyer = USERS.find(u => u.id === conv.buyerId)!;
        const item = LISTINGS.find(l => l.id === conv.listingId)!;
        
        const lastMsg = conv.messages[conv.messages.length - 1];
        const lastDate = new Date(Date.now() - (lastMsg.offsetMin * 60 * 1000));
        
        let lastMessageText = "";
        if (lastMsg.type === "text") lastMessageText = lastMsg.text;
        else if (lastMsg.type === "offer") lastMessageText = `💰 Offre: ${lastMsg.amount} DH`;
        else if (lastMsg.type === "audio") lastMessageText = "🎙 Message vocal";

        // Save conversation
        await setDoc(doc(db, "conversations", conv.id), {
          listingId: conv.listingId,
          sellerId: conv.sellerId,
          buyerId: conv.buyerId,
          lastMessage: lastMessageText,
          lastTime: lastDate,
          buyerName: buyer.name,
          buyerAvatar: buyer.avatar,
          sellerName: seller.name,
          sellerAvatar: seller.avatar,
          itemTitle: item.title,
          itemPhoto: item.photo,
          unread: conv.unread,
          online: conv.online,
        });

        // Save messages in subcollection
        for (let i = 0; i < conv.messages.length; i++) {
          const msg = conv.messages[i];
          const user = msg.isSeller ? seller : buyer;
          const msgDate = new Date(Date.now() - (msg.offsetMin * 60 * 1000));
          
          await addDoc(collection(db, "messages"), {
            conversationId: conv.id,
            text: msg.text || (msg.type === "offer" ? `Offre: ${msg.amount} DH` : "Message vocal"),
            createdAt: msgDate,
            user: { _id: msg.isSeller ? "seller" : "buyer", name: user.name },
            type: msg.type,
            ...(msg.amount && { amount: msg.amount }),
            ...(msg.status && { status: msg.status }),
            ...(msg.audioDuration && { audioDuration: msg.audioDuration })
          });
        }
      }

      setStatus("✅ Terminé ! Base de données remplie avec succès.");
    } catch (e: any) {
      setStatus("❌ Erreur: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Générateur de données</Text>
        <Text style={styles.subtitle}>
          Cliquez ci-dessous pour injecter des utilisateurs, annonces et un historique complet de conversations dans Firestore.
        </Text>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{status}</Text>
          {loading && <ActivityIndicator size="small" color={Brand.primary} style={{ marginTop: 10 }} />}
        </View>

        <TouchableOpacity onPress={performSeed} disabled={loading} activeOpacity={0.8}>
          <LinearGradient
            colors={[Brand.primary, Brand.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, loading && { opacity: 0.5 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? "Génération en cours..." : "Remplir la base de données"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Brand.warmGray,
    padding: 20,
  },
  card: {
    backgroundColor: Brand.white,
    padding: 24,
    borderRadius: Radius.xl,
    width: "100%",
    maxWidth: 400,
    ...Shadow.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Brand.charcoal,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Brand.grayDark,
    lineHeight: 20,
    marginBottom: 24,
  },
  statusBox: {
    backgroundColor: Brand.offWhite,
    padding: 16,
    borderRadius: Radius.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Brand.grayLight,
    minHeight: 80,
    justifyContent: "center",
  },
  statusText: {
    color: Brand.charcoal,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: "center",
    ...Shadow.md,
  },
  buttonText: {
    color: Brand.white,
    fontWeight: "700",
    fontSize: 16,
  },
});