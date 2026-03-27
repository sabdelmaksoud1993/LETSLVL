import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/theme';
import { formatPrice } from '../../src/lib/utils';
import {
  getProducts,
  getCategories,
  getStreams,
  type Product,
  type Category,
  type Stream,
} from '../../src/lib/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

// Fallback mock data
const MOCK_CATEGORIES = [
  'All',
  'Streetwear',
  'Sneakers',
  'Luxury',
  'Vintage',
  'Accessories',
  'Watches',
];

const MOCK_STREAMS = [
  { id: '1', title: 'Supreme Drop Unboxing', seller_name: 'HypeKing', viewer_count: 1243 },
  { id: '2', title: 'Rare Jordans Collection', seller_name: 'SneakerVault', viewer_count: 876 },
  { id: '3', title: 'Designer Bags Live Auction', seller_name: 'LuxeDeals', viewer_count: 2100 },
  { id: '4', title: 'Y2K Fashion Finds', seller_name: 'RetroStyle', viewer_count: 543 },
];

const MOCK_PRODUCTS = [
  { id: '1', title: 'Air Jordan 1 Retro High OG', brand: 'Nike', price: 699, images: [] },
  { id: '2', title: 'Box Logo Hoodie FW24', brand: 'Supreme', price: 1279, images: [] },
  { id: '3', title: 'Classic Leather Belt', brand: 'Gucci', price: 1650, images: [] },
  { id: '4', title: 'Yeezy Slide Onyx', brand: 'Adidas', price: 479, images: [] },
  { id: '5', title: 'Essentials Hoodie', brand: 'Fear of God', price: 715, images: [] },
  { id: '6', title: 'Submariner Date', brand: 'Rolex', price: 53200, images: [] },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<readonly string[]>(MOCK_CATEGORIES);
  const [streams, setStreams] = useState<readonly (Stream | typeof MOCK_STREAMS[0])[]>(MOCK_STREAMS);
  const [products, setProducts] = useState<readonly (Product | typeof MOCK_PRODUCTS[0])[]>(MOCK_PRODUCTS);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fetchData = useCallback(async () => {
    try {
      const [categoriesData, featuredProducts, liveStreams] = await Promise.all([
        getCategories(),
        getProducts({ featured: true, limit: 6 }),
        getStreams({ status: 'live', limit: 4 }),
      ]);

      if (categoriesData.length > 0) {
        setCategories(['All', ...categoriesData.map((c) => c.name)]);
      }

      if (featuredProducts.length > 0) {
        setProducts(featuredProducts);
      }

      if (liveStreams.length > 0) {
        setStreams(liveStreams);
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      // Keep mock data as fallback
    } finally {
      setLoading(false);
      fadeIn();
    }
  }, [fadeIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const getProductImage = (item: Product | typeof MOCK_PRODUCTS[0]): string | null => {
    if ('images' in item && Array.isArray(item.images) && item.images.length > 0) {
      return item.images[0] as string;
    }
    return null;
  };

  const getProductBrand = (item: Product | typeof MOCK_PRODUCTS[0]): string => {
    return item.brand ?? 'Unknown';
  };

  const renderProductCard = ({
    item,
  }: {
    item: Product | typeof MOCK_PRODUCTS[0];
  }) => {
    const imageUrl = getProductImage(item);
    const brand = getProductBrand(item);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.productImage}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImageFull} resizeMode="cover" />
          ) : (
            <Text style={styles.productImagePlaceholder}>
              {brand.charAt(0)}
            </Text>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{brand}</Text>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>
            {formatPrice(item.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.logo}>LET&apos;S LVL</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => Alert.alert('Search', 'Search coming soon')}
          >
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
          {categories.map((cat) => (
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
            {streams.map((stream) => (
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
                      {(stream.viewer_count ?? 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.streamTitle} numberOfLines={1}>
                  {stream.title}
                </Text>
                <Text style={styles.streamSeller}>
                  {stream.seller_name ?? 'Unknown'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRENDING</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products as (Product | typeof MOCK_PRODUCTS[0])[]}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </Animated.View>

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
  productImageFull: {
    width: '100%',
    height: '100%',
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
