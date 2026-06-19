import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Brand, Radius, Shadow } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import BrandLoader from "../../components/brand-loader";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) {
          setUser(snap.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return <BrandLoader />;
  }

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Utilisateur introuvable</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Brand.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          <Image source={{ uri: user.avatar }} style={s.avatar} />
          <View style={s.nameRow}>
            <Text style={s.name}>{user.name}</Text>
            {user.verified && (
              <Ionicons name="checkmark-circle" size={20} color={Brand.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={s.memberSince}>Membre depuis {user.memberSince || 2023}</Text>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statValue}>⭐ {user.rating}</Text>
              <Text style={s.statLabel}>Avis ({user.totalSales || 0})</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statValue}>{user.totalSales || 0}</Text>
              <Text style={s.statLabel}>Ventes</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statValue}>{user.totalPurchases || 0}</Text>
              <Text style={s.statLabel}>Achats</Text>
            </View>
          </View>
        </View>

        {/* Fake Reviews */}
        <Text style={s.sectionTitle}>Avis récents</Text>
        
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={s.reviewCard}>
            <View style={s.reviewHeader}>
              <Text style={s.reviewAuthor}>Utilisateur_00{i+1}</Text>
              <Text style={s.reviewRating}>⭐⭐⭐⭐⭐</Text>
            </View>
            <Text style={s.reviewText}>
              {i === 0 && "Très bonne communication, produit conforme à la description !"}
              {i === 1 && "Vendeur sérieux et ponctuel, je recommande les yeux fermés."}
              {i === 2 && "Transaction parfaite, merci beaucoup !"}
            </Text>
            <Text style={s.reviewDate}>Il y a {i + 1} semaine(s)</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.bgDark },
  center: { flex: 1, backgroundColor: Brand.bgDark, justifyContent: "center", alignItems: "center" },
  errorText: { color: Brand.subText, fontSize: 16 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Brand.surface,
    borderBottomWidth: 1,
    borderBottomColor: Brand.surfaceLight,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Brand.text },
  
  content: { padding: 16, paddingBottom: 40 },
  
  profileCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...Shadow.md,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '800', color: Brand.text },
  memberSince: { fontSize: 14, color: Brand.subText, marginBottom: 24 },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: Brand.surfaceLight,
    paddingVertical: 16,
    borderRadius: Radius.lg,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: Brand.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: Brand.subText, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: Brand.surface },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Brand.text, marginBottom: 16, marginLeft: 4 },
  
  reviewCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: Brand.text },
  reviewRating: { fontSize: 12 },
  reviewText: { fontSize: 14, color: Brand.subText, lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 12, color: Brand.subText, opacity: 0.7 },
});
