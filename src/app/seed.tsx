import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { doc, setDoc, collection, addDoc, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebaseConfig";
import { Brand, Radius, Shadow } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

// ─── Dummy Data Generators ───

const USERS = [
  { id: "user_youssef", name: "Youssef", avatar: "https://i.pravatar.cc/150?img=11", rating: 4.8, totalSales: 47, memberSince: 2020, verified: true },
  { id: "user_doha", name: "Doha", avatar: "https://i.pravatar.cc/150?img=12", rating: 4.5, totalPurchases: 12, memberSince: 2021, verified: true },
  { id: "user_mehdi", name: "Mehdi", avatar: "https://i.pravatar.cc/150?img=33", rating: 4.9, totalSales: 120, memberSince: 2019, verified: true },
  { id: "user_sarah", name: "Sarah", avatar: "https://i.pravatar.cc/150?img=5", rating: 5.0, totalPurchases: 3, memberSince: 2023, verified: false },
  { id: "user_khalil", name: "Khalil", avatar: "https://i.pravatar.cc/150?img=53", rating: 4.2, totalSales: 15, memberSince: 2022, verified: false },
  { id: "user_rim", name: "Rim", avatar: "https://i.pravatar.cc/150?img=47", rating: 4.7, totalPurchases: 22, memberSince: 2020, verified: true },
  { id: "user_hassan", name: "Hassan", avatar: "https://i.pravatar.cc/150?img=14", rating: 4.6, totalSales: 88, memberSince: 2018, verified: true },
  { id: "user_leila", name: "Leila", avatar: "https://i.pravatar.cc/150?img=44", rating: 4.4, totalPurchases: 7, memberSince: 2022, verified: false },
  { id: "user_amin", name: "Amin", avatar: "https://i.pravatar.cc/150?img=68", rating: 4.1, totalSales: 4, memberSince: 2023, verified: false },
  { id: "user_fatima", name: "Fatima", avatar: "https://i.pravatar.cc/150?img=22", rating: 4.9, totalSales: 210, memberSince: 2017, verified: true },
  { id: "buyer", name: "Moi (Acheteur)", avatar: "https://i.pravatar.cc/150?img=8", rating: 4.5, totalPurchases: 12, memberSince: 2021, verified: true },
];

const LISTINGS = [
  { id: "item_1", title: "iPhone 13 Pro Max - Comme neuf", price: 7500, priceFirm: true, photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", sellerId: "user_hassan" },
  { id: "item_2", title: "Air Max 97 - Pointure 42", price: 450, priceFirm: false, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", sellerId: "user_mehdi" },
  { id: "item_3", title: "Canapé Vintage en Cuir", price: 3200, priceFirm: false, photo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", sellerId: "user_fatima" },
  { id: "item_4", title: "VTT Rockrider ST100", price: 1200, priceFirm: true, photo: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", sellerId: "user_khalil" },
  { id: "item_5", title: "Montre Casio Vintage", price: 250, priceFirm: false, photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", sellerId: "user_youssef" },
  { id: "item_6", title: "Appareil Photo Sony A6000", price: 4000, priceFirm: false, photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", sellerId: "user_mehdi" },
  { id: "item_7", title: "Blouson en cuir ZARA", price: 300, priceFirm: false, photo: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", sellerId: "user_doha" },
  { id: "item_8", title: "MacBook Pro M1 2020", price: 9000, priceFirm: true, photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", sellerId: "user_hassan" },
  { id: "item_9", title: "Table Basse Scandinave", price: 650, priceFirm: false, photo: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400", sellerId: "user_fatima" },
  { id: "item_10", title: "AirPods Pro 2", price: 1800, priceFirm: true, photo: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400", sellerId: "user_amin" },
];

// Note: To match chat logic, we just assume the current user is always "buyer" when testing for simplicity, 
// so the other person in the inbox will be shown as the seller/buyer based on their id.
const CONVERSATIONS = [
  { id: "conv_1", listingId: "item_1", sellerId: "user_hassan", buyerId: "buyer", unread: 2, online: true, messages: [
    { text: "Bonjour, la batterie est à quel pourcentage ?", type: "text", isSeller: false, offsetMin: 12 },
    { text: "Bonjour ! L'état de la batterie est à 92%.", type: "text", isSeller: true, offsetMin: 10 },
    { type: "audio", isSeller: false, audioDuration: 12, offsetMin: 5 },
    { text: "D'accord, je vous écoute.", type: "text", isSeller: true, offsetMin: 2 },
  ]},
  { id: "conv_2", listingId: "item_2", sellerId: "user_mehdi", buyerId: "buyer", unread: 0, online: false, messages: [
    { text: "Salam, c'est taillé grand ou petit ?", type: "text", isSeller: false, offsetMin: 1440 }, 
    { text: "Salam, c'est une taille 42 standard.", type: "text", isSeller: true, offsetMin: 1400 },
    { type: "offer", amount: 400, status: "refused", isSeller: false, offsetMin: 1300 },
    { text: "Dernier prix c'est 450 DH mon ami.", type: "text", isSeller: true, offsetMin: 1290 },
  ]},
  { id: "conv_3", listingId: "item_3", sellerId: "user_fatima", buyerId: "buyer", unread: 1, online: true, messages: [
    { text: "Le canapé est toujours disponible ?", type: "text", isSeller: false, offsetMin: 60 },
    { text: "Oui, toujours dispo.", type: "text", isSeller: true, offsetMin: 45 },
    { text: "Vous assurez la livraison ?", type: "text", isSeller: false, offsetMin: 5 },
  ]},
  { id: "conv_4", listingId: "item_4", sellerId: "user_khalil", buyerId: "buyer", unread: 0, online: true, messages: [
    { text: "Bonsoir, je suis intéressé par le vélo.", type: "text", isSeller: false, offsetMin: 40 },
    { text: "Bonsoir, avec plaisir. Vous voulez passer le voir ?", type: "text", isSeller: true, offsetMin: 35 },
    { text: "Oui, demain matin inshallah.", type: "text", isSeller: false, offsetMin: 20 },
  ]},
  { id: "conv_5", listingId: "item_5", sellerId: "user_youssef", buyerId: "buyer", unread: 5, online: false, messages: [
    { text: "Elle est waterproof ?", type: "text", isSeller: false, offsetMin: 600 },
    { text: "Oui, résistante à l'eau.", type: "text", isSeller: true, offsetMin: 590 },
    { type: "offer", amount: 200, status: "pending", isSeller: false, offsetMin: 500 },
    { text: "Je vous la prends aujourd'hui à 200 DH.", type: "text", isSeller: false, offsetMin: 495 },
    { text: "On peut se voir à Maarif ?", type: "text", isSeller: false, offsetMin: 490 },
  ]},
  { id: "conv_6", listingId: "item_6", sellerId: "user_mehdi", buyerId: "buyer", unread: 0, online: true, messages: [
    { text: "L'objectif 50mm est inclus avec ?", type: "text", isSeller: false, offsetMin: 2880 },
    { text: "Non, c'est le boîtier nu.", type: "text", isSeller: true, offsetMin: 2800 },
    { text: "Ah dommage, merci quand même.", type: "text", isSeller: false, offsetMin: 2790 },
  ]},
  { id: "conv_7", listingId: "item_7", sellerId: "user_doha", buyerId: "buyer", unread: 0, online: false, messages: [
    { text: "C'est du vrai cuir ?", type: "text", isSeller: false, offsetMin: 4320 }, 
    { text: "Oui, 100% cuir de vachette.", type: "text", isSeller: true, offsetMin: 4300 },
    { type: "offer", amount: 250, status: "accepted", isSeller: false, offsetMin: 4200 },
    { text: "Super ! Je vous appelle demain.", type: "text", isSeller: true, offsetMin: 4190 },
  ]},
  { id: "conv_8", listingId: "item_8", sellerId: "user_hassan", buyerId: "buyer", unread: 1, online: true, messages: [
    { text: "Garantie AppleCare dispo ?", type: "text", isSeller: false, offsetMin: 30 },
    { text: "Non, expirée le mois dernier.", type: "text", isSeller: true, offsetMin: 15 },
    { text: "Est-ce qu'il y a des rayures sur l'écran ?", type: "text", isSeller: false, offsetMin: 2 },
  ]},
  { id: "conv_9", listingId: "item_9", sellerId: "user_fatima", buyerId: "buyer", unread: 0, online: false, messages: [
    { text: "Quelles sont les dimensions svp ?", type: "text", isSeller: false, offsetMin: 10000 },
    { text: "120cm x 60cm.", type: "text", isSeller: true, offsetMin: 9900 },
  ]},
  { id: "conv_10", listingId: "item_10", sellerId: "user_amin", buyerId: "buyer", unread: 0, online: true, messages: [
    { text: "Avec la boîte d'origine ?", type: "text", isSeller: false, offsetMin: 180 },
    { text: "Oui boîte et câble jamais utilisé.", type: "text", isSeller: true, offsetMin: 170 },
    { type: "audio", isSeller: false, audioDuration: 8, offsetMin: 160 },
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
          lastMessageSenderId: lastMsg.isSeller ? conv.sellerId : conv.buyerId,
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