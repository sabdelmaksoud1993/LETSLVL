import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

interface WishlistItem {
  readonly id: string;
  readonly title: string;
  readonly brand: string;
  readonly price: number;
  readonly image: null;
}

const INITIAL_WISHLIST: readonly WishlistItem[] = [
  { id: '1', title: 'Air Jordan 1 Retro High OG', brand: 'Nike', price: 189.99, image: null },
  { id: '2', title: 'Box Logo Hoodie FW24', brand: 'Supreme', price: 348.00, image: null },
  { id: '3', title: 'Yeezy Slide Onyx', brand: 'Adidas', price: 129.99, image: null },
  { id: '4', title: 'Submariner Date', brand: 'Rolex', price: 14500.00, image: null },
  { id: '5', title: 'Essentials Hoodie', brand: 'Fear of God', price: 195.00, image: null },
  { id: '6', title: 'Classic Leather Belt', brand: 'Gucci', price: 450.00, image: null },
];

export default function WishlistScreen() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<readonly WishlistItem[]>(INITIAL_WISHLIST);

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

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

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.productImage}>
        <Text style={styles.imagePlaceholder}>{item.brand.charAt(0)}</Text>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => removeFromWishlist(item.id)}
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
          ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
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
