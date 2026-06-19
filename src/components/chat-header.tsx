import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Brand, Radius, Shadow } from '../constants/theme';

type UserInfo = {
  name: string;
  avatar: string;
  rating: number;
  totalSales?: number;
  totalPurchases?: number;
  memberSince: number;
  verified: boolean;
  _id?: string;
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
  role: 'buyer' | 'seller';
  otherUser: UserInfo;
  listing: Listing;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Minimal Header ── */}
      <View style={styles.headerCore}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.avatarContainer}
          activeOpacity={0.8}
          onPress={() => {
            if (otherUser._id) {
              router.push(`/user/${otherUser._id}`);
            }
          }}
        >
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser.name}
            </Text>
            {otherUser.verified && (
              <LinearGradient
                colors={[Brand.primaryLight, Brand.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.verifiedBadge}
              >
                <Text style={styles.verifiedText}>✓</Text>
              </LinearGradient>
            )}
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Active maintenant</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.rating}>⭐ {otherUser.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* ── Floating Elevated Pill Banner ── */}
      <View style={styles.pillBannerWrapper}>
        <View style={styles.listingPill}>
          <Image source={{ uri: listing.photo }} style={styles.listingPhoto} />

          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            {listing.priceFirm && (
              <Text style={styles.firmTagText}>Prix ferme</Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.listingPrice}>
              {listing.price.toLocaleString('fr-MA')} DH
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.bgDark,
    zIndex: 10,
    paddingBottom: 6,
  },
  headerCore: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Brand.bgDark,
  },
  backButton: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 32,
    lineHeight: 32,
    color: Brand.text,
    fontWeight: '300',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Brand.surface,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Brand.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.green, // Standard success green for online presence
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: Brand.text,
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Brand.text,
    lineHeight: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    color: Brand.subText,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.subText,
    marginHorizontal: 8,
  },
  rating: {
    fontSize: 13,
    color: Brand.subText,
    fontWeight: '600',
  },

  /* ── Pill Banner ── */
  pillBannerWrapper: {
    paddingHorizontal: 16,
    // Negative margin to create a slight overlap effect with the header's core whitespace
    marginTop: -4, 
    marginBottom: 12,
  },
  listingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 999, // Pill shape
    padding: 6,
    paddingRight: 8,
    ...Shadow.md,
  },
  listingPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.surfaceLight,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
    letterSpacing: -0.2,
  },
  firmTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Brand.subText,
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 12,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Brand.text,
    letterSpacing: -0.3,
  },
});