import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../firebaseConfig';
import { Brand, Radius } from '../constants/theme';

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
      <View style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor={Brand.white} />
        <ActivityIndicator size="large" color={Brand.primary} />
      </View>
    );
  }

  /* ── Main render ── */
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} />

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
          <Text style={styles.emptyEmoji}>💬</Text>
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
                    {item.lastMessage}
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
    backgroundColor: Brand.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Brand.white,
  },

  /* Header */
  header: {
    backgroundColor: Brand.white,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: Brand.charcoal,
    letterSpacing: -1.2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Brand.grayDark,
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
    backgroundColor: Brand.white,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Brand.grayLight,
    position: 'relative',
  },
  rowUnread: {
    backgroundColor: Brand.greenLight,
  },
  unreadVerticalLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Brand.primary,
  },

  /* Avatar */
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.grayLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Brand.green,
    borderWidth: 3,
    borderColor: Brand.white,
  },

  /* Middle */
  middle: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.charcoal,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 13,
    color: Brand.grayDark,
    fontWeight: '500',
  },
  timeTextUnread: {
    color: Brand.primary,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 14,
    color: Brand.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 15,
    color: Brand.grayDark,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: Brand.charcoal,
    fontWeight: '700',
  },

  /* Right column */
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemPhoto: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Brand.grayLight,
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Brand.white,
  },
  unreadBadgeText: {
    color: Brand.white,
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
    color: Brand.charcoal,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Brand.grayDark,
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
    color: Brand.white,
    fontSize: 17,
    fontWeight: '700',
  },
});