import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

type UserInfo = {
  name: string;
  avatar: string;
  rating: number;
  totalSales?: number;
  totalPurchases?: number;
  memberSince: number;
  verified: boolean;
};

type Listing = {
  title: string;
  price: number;
  priceFirm: boolean;
  photo: string;
};

export default function ChatHeader({
  role,
  otherUser,
  listing,
}: {
  role: "buyer" | "seller";
  otherUser: UserInfo;
  listing: Listing;
}) {
  const yearsActive = new Date().getFullYear() - otherUser.memberSince;
  // Buyer sees seller's sales; seller sees buyer's purchases
  const activityLabel =
    role === "buyer"
      ? `${otherUser.totalSales ?? 0} ventes`
      : `${otherUser.totalPurchases ?? 0} achats`;

  return (
    <View style={styles.wrap}>
      {/* Reputation row */}
      <View style={styles.userRow}>
        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{otherUser.name}</Text>
            {otherUser.verified && <Text style={styles.verified}>✓ Vérifié</Text>}
          </View>
          <Text style={styles.stats}>
            ⭐ {otherUser.rating}  ·  {activityLabel}  ·  {yearsActive} ans
          </Text>
        </View>
      </View>

      {/* Listing banner — buyer always sees it; seller sees what's being sold too */}
      <View style={styles.banner}>
        <Image source={{ uri: listing.photo }} style={styles.itemPhoto} />
        <View style={styles.bannerInfo}>
          <Text style={styles.itemTitle}>{listing.title}</Text>
          <Text style={styles.price}>
            {listing.price} DH{listing.priceFirm ? "  ·  prix ferme" : ""}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>
            {role === "buyer" ? "Voir le profil" : "Voir l'acheteur"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Options</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  userRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#eee" },
  userInfo: { marginLeft: 10, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "700", color: "#222" },
  verified: { fontSize: 11, color: "#2e7d32", fontWeight: "600" },
  stats: { fontSize: 13, color: "#666", marginTop: 2 },
  banner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f7f7f7", padding: 10, marginHorizontal: 10, borderRadius: 10,
  },
  itemPhoto: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#eee" },
  bannerInfo: { marginLeft: 10, flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  price: { fontSize: 14, color: "#ff6f00", fontWeight: "700", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, padding: 10 },
  actionBtn: {
    flex: 1, backgroundColor: "#f0f0f0", paddingVertical: 9,
    borderRadius: 8, alignItems: "center",
  },
  actionText: { fontSize: 13, fontWeight: "600", color: "#444" },
});