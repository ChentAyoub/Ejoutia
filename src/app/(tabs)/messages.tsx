import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../firebaseConfig';
import { Brand, Shadow, Radius } from '../../constants/theme';
import BrandLoader from '../../components/brand-loader';
import { Ionicons } from '@expo/vector-icons';

/* ────────────────────────────────────────────
   Relative-time helper (French)
   ──────────────────────────────────────────── */
function relativeTime(timestamp: any): string {
  if (!timestamp) return '';

  let date: Date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 30) return 'Maintenant';
  if (diffMin < 1) return `il y a ${diffSec}s`;
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffHr < 24) return `il y a ${diffHr}h`;
  if (diffDay === 1) return 'Hier';
  if (diffDay < 7) return `il y a ${diffDay}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ────────────────────────────────────────────
   Inbox Screen
   ──────────────────────────────────────────── */
export default function Inbox() {
  const router = useRouter();
  const [convos, setConvos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      orderBy('lastTime', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setConvos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Brand.bgDark }}>
        <StatusBar barStyle="light-content" backgroundColor={Brand.bgDark} />
        <BrandLoader />
      </View>
    );
  }

  /* ── Main render ── */
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Brand.bgDark} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          {convos.length === 0
            ? 'Aucune conversation'
            : convos.length === 1
              ? '1 conversation'
              : `${convos.length} conversations`}
        </Text>
      </View>

      {/* ── Empty state ── */}
      {convos.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="chatbubbles-outline" size={48} color={Brand.primary} />
          </View>
          <Text style={styles.emptyText}>Aucun message</Text>
          <Text style={styles.emptySubtext}>
            Vos conversations apparaîtront ici
          </Text>
          <TouchableOpacity
            style={styles.emptyButtonWrapper}
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <LinearGradient
              colors={[Brand.primary, Brand.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
              <Text style={styles.emptyButtonText}>Découvrir des annonces</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Conversation list ── */
        <FlatList
          data={convos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isUnread = item.unread > 0;
            return (
              <TouchableOpacity
                style={[
                  styles.row,
                  isUnread && styles.rowUnread,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/chat-buyer?conversationId=${item.id}`)
                }
              >
                {/* Vertical Line Indicator for Unread */}
                {isUnread && <View style={styles.unreadVerticalLine} />}

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: item.sellerAvatar }}
                    style={styles.avatar}
                  />
                  {item.online && <View style={styles.onlineDot} />}
                </View>

                {/* Middle: name, item title, last message */}
                <View style={styles.middle}>
                  <View style={styles.nameRow}>
                    <Text style={styles.sellerName} numberOfLines={1}>
                      {item.sellerName}
                    </Text>
                    <Text style={[styles.timeText, isUnread && styles.timeTextUnread]}>
                      {relativeTime(item.lastTime)}
                    </Text>
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.itemTitle}
                  </Text>
                  <Text
                    style={[
                      styles.lastMessage,
                      isUnread && styles.lastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessageSenderId === "buyer" ? "Vous: " : ""}{item.lastMessage}
                  </Text>
                </View>

                {/* Right: item photo */}
                <View style={styles.rightCol}>
                  <Image
                    source={{ uri: item.itemPhoto }}
                    style={styles.itemPhoto}
                  />
                  {isUnread && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

/* ────────────────────────────────────────────
   Styles
   ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* Screen */
  screen: {
    flex: 1,
    backgroundColor: Brand.bgDark,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Brand.bgDark,
    paddingHorizontal: 24,
  },
  
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 111, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  /* Header */
  header: {
    backgroundColor: Brand.bgDark,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: Brand.text,
    letterSpacing: -1.2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Brand.subText,
    marginTop: 4,
    fontWeight: '500',
  },

  /* List */
  listContent: {
    paddingBottom: 40,
  },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.bgDark,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 4,
  },
  rowUnread: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    marginHorizontal: 8,
    paddingHorizontal: 16,
  },
  unreadVerticalLine: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 4,
    backgroundColor: Brand.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  /* Avatar */
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Brand.surfaceLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Brand.green,
    borderWidth: 2,
    borderColor: Brand.bgDark,
  },

  /* Middle */
  middle: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: '800',
    color: Brand.text,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 13,
    color: Brand.subText,
    fontWeight: '500',
  },
  timeTextUnread: {
    color: Brand.primary,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 15,
    color: Brand.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: Brand.subText,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: Brand.text,
    fontWeight: '700',
  },

  /* Right column */
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemPhoto: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceLight,
  },
  unreadBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Brand.bgDark,
  },
  unreadBadgeText: {
    color: Brand.text,
    fontSize: 11,
    fontWeight: '800',
  },

  /* Empty state */
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '800',
    color: Brand.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Brand.subText,
    marginBottom: 32,
  },
  emptyButtonWrapper: {
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: Brand.text,
    fontSize: 17,
    fontWeight: '700',
  },
});