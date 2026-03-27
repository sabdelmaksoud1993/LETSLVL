import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';
import { formatPrice } from '../../lib/utils';
import { useAuth } from '../../lib/auth-context';
import {
  getWishlist,
  removeFromWishlist as removeFromWishlistApi,
  type WishlistItem,
  type Product,
} from '../../lib/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

// Fallback mock data for unauthenticated state
const MOCK_WISHLIST = [
  { id: '1', title: 'Air Jordan 1 Retro High OG', brand: 'Nike', price: 699, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  { id: '2', title: 'Box Logo Hoodie FW24', brand: 'Supreme', price: 1279, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
  { id: '3', title: 'Yeezy Slide Onyx', brand: 'Adidas', price: 479, image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400&h=400&fit=crop' },
  { id: '4', title: 'Submariner Date', brand: 'Rolex', price: 53200, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop' },
  { id: '5', title: 'Essentials Hoodie', brand: 'Fear of God', price: 715, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop' },
  { id: '6', title: 'Classic Leather Belt', brand: 'Gucci', price: 1650, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
];

type WishlistDisplayItem = {
  readonly id: string;
  readonly product_id: string;
  readonly title: string;
  readonly brand: string;
  readonly price: number;
  readonly image: string | null;
};

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<readonly WishlistDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      // Show mock data for non-authenticated users
      setWishlist(
        MOCK_WISHLIST.map((item) => ({
          id: item.id,
          product_id: item.id,
          title: item.title,
          brand: item.brand,
          price: item.price,
          image: item.image ?? null,
        })),
      );
      setLoading(false);
      return;
    }

    try {
      const data = await getWishlist(user.id);
      setWishlist(
        data.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          title: item.product?.title ?? 'Unknown',
          brand: item.product?.brand ?? 'Unknown',
          price: item.product?.price ?? 0,
          image:
            item.product?.images && item.product.images.length > 0
              ? (item.product.images[0] as string)
              : null,
        })),
      );
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, [fetchWishlist]);

  const handleRemove = useCallback(
    async (item: WishlistDisplayItem) => {
      if (!user) {
        // Local-only removal for unauthenticated users
        setWishlist((prev) => prev.filter((w) => w.id !== item.id));
        return;
      }

      try {
        await removeFromWishlistApi(user.id, item.product_id);
        setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      } catch (error) {
        Alert.alert('Error', 'Failed to remove item from wishlist');
        console.error('Remove from wishlist failed:', error);
      }
    },
    [user],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WISHLIST</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </SafeAreaView>
    );
  }

  if (wishlist.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WISHLIST</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{'\u2665'}</Text>
          <Text style={styles.emptyTitle}>No saved items</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on products to save them here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: WishlistDisplayItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.product_id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.productImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImageFull} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>{item.brand.charAt(0)}</Text>
        )}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => handleRemove(item)}
        >
          <Text style={styles.heartIcon}>{'\u2665'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          {formatPrice(item.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WISHLIST</Text>
        <Text style={styles.itemCount}>{wishlist.length} items</Text>
      </View>

      <FlatList
        data={wishlist as WishlistDisplayItem[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.yellow}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
  },
  itemCount: {
    fontSize: 13,
    color: colors.smoke,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 64,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.smoke,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate,
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImageFull: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.smoke,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 16,
    color: '#EF4444',
  },
  productInfo: {
    padding: spacing.sm,
  },
  productBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.yellow,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginTop: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
  },
});
