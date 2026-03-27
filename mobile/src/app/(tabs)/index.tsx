import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

const CATEGORIES = [
  'All',
  'Streetwear',
  'Sneakers',
  'Luxury',
  'Vintage',
  'Accessories',
  'Watches',
];

const LIVE_STREAMS = [
  {
    id: '1',
    title: 'Supreme Drop Unboxing',
    seller: 'HypeKing',
    viewers: 1243,
    thumbnail: null,
  },
  {
    id: '2',
    title: 'Rare Jordans Collection',
    seller: 'SneakerVault',
    viewers: 876,
    thumbnail: null,
  },
  {
    id: '3',
    title: 'Designer Bags Live Auction',
    seller: 'LuxeDeals',
    viewers: 2100,
    thumbnail: null,
  },
  {
    id: '4',
    title: 'Y2K Fashion Finds',
    seller: 'RetroStyle',
    viewers: 543,
    thumbnail: null,
  },
];

const TRENDING_PRODUCTS = [
  {
    id: '1',
    title: 'Air Jordan 1 Retro High OG',
    brand: 'Nike',
    price: 189.99,
    image: null,
  },
  {
    id: '2',
    title: 'Box Logo Hoodie FW24',
    brand: 'Supreme',
    price: 348.0,
    image: null,
  },
  {
    id: '3',
    title: 'Classic Leather Belt',
    brand: 'Gucci',
    price: 450.0,
    image: null,
  },
  {
    id: '4',
    title: 'Yeezy Slide Onyx',
    brand: 'Adidas',
    price: 129.99,
    image: null,
  },
  {
    id: '5',
    title: 'Essentials Hoodie',
    brand: 'Fear of God',
    price: 195.0,
    image: null,
  },
  {
    id: '6',
    title: 'Submariner Date',
    brand: 'Rolex',
    price: 14500.0,
    image: null,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderProductCard = ({
    item,
  }: {
    item: (typeof TRENDING_PRODUCTS)[0];
  }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.productImage}>
        <Text style={styles.productImagePlaceholder}>
          {item.brand.charAt(0)}
        </Text>
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.yellow}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>LET&apos;S LVL</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>&#x1F50D;</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>BUILT FOR{'\n'}THE BOLD.</Text>
          <Text style={styles.heroSubtitle}>
            Live auctions. Exclusive drops. Real culture.
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>EXPLORE NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Live Now Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveNowHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>LIVE NOW</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/live')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveStreamsList}
          >
            {LIVE_STREAMS.map((stream) => (
              <TouchableOpacity
                key={stream.id}
                style={styles.streamCard}
                onPress={() => router.push(`/live/${stream.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.streamThumbnail}>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveBadgeDot} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                  <View style={styles.viewerCount}>
                    <Text style={styles.viewerCountText}>
                      {stream.viewers.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.streamTitle} numberOfLines={1}>
                  {stream.title}
                </Text>
                <Text style={styles.streamSeller}>{stream.seller}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRENDING</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={TRENDING_PRODUCTS}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.yellow,
    letterSpacing: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  heroBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.smoke,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  heroButton: {
    backgroundColor: colors.yellow,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.black,
    letterSpacing: 1,
  },
  categoriesContainer: {
    marginTop: spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.slate,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.smoke,
  },
  categoryTextActive: {
    color: colors.black,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  liveNowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: 13,
    color: colors.yellow,
    fontWeight: '600',
  },
  liveStreamsList: {
    paddingHorizontal: spacing.md,
  },
  streamCard: {
    width: 180,
    marginRight: spacing.md,
  },
  streamThumbnail: {
    width: 180,
    height: 240,
    backgroundColor: colors.slate,
    borderRadius: borderRadius.lg,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  viewerCount: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  viewerCountText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  streamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.sm,
  },
  streamSeller: {
    fontSize: 12,
    color: colors.smoke,
    marginTop: 2,
  },
  productRow: {
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate,
  },
  productImage: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH,
    backgroundColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImagePlaceholder: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.smoke,
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
  bottomSpacer: {
    height: spacing.xl,
  },
});
