import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/theme';
import { formatPrice } from '../../src/lib/utils';
import { useAuth } from '../../src/lib/auth-context';
import {
  getProduct,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  getCartFromStorage,
  saveCartToStorage,
  type Product,
  type CartItem,
} from '../../src/lib/data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fallback mock data
const MOCK_PRODUCT = {
  id: '1',
  title: 'Air Jordan 1 Retro High OG',
  brand: 'Nike',
  price: 699,
  images: [],
  sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
  colors: ['Chicago', 'Bred', 'Royal', 'Shadow'],
  description:
    'The Air Jordan 1 Retro High OG brings back the iconic silhouette that started it all. Premium leather upper with classic colorway, Nike Air cushioning, and the unmistakable Wings logo.',
  seller_id: null,
};

const COLOR_HEX_MAP: Record<string, string> = {
  Chicago: '#C41E3A',
  Bred: '#1A1A1A',
  Royal: '#2563EB',
  Shadow: '#6B7280',
  Black: '#1A1A1A',
  White: '#F0F0F0',
  Red: '#EF4444',
  Blue: '#3B82F6',
  Green: '#22C55E',
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getProduct(id);
      if (data) {
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0] as string);
        }
      } else {
        // Use mock as fallback
        setProduct(MOCK_PRODUCT as unknown as Product);
        setSelectedColor('Chicago');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setProduct(MOCK_PRODUCT as unknown as Product);
      setSelectedColor('Chicago');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkWishlist = useCallback(async () => {
    if (!user || !id) return;
    try {
      const inWishlist = await isInWishlist(user.id, id);
      setIsWishlisted(inWishlist);
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  }, [user, id]);

  useEffect(() => {
    fetchProduct();
    checkWishlist();
  }, [fetchProduct, checkWishlist]);

  const handleWishlistToggle = useCallback(async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!id) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(user.id, id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(user.id, id);
        setIsWishlisted(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
      console.error('Wishlist toggle failed:', error);
    }
  }, [user, id, isWishlisted, router]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (!selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart.');
      return;
    }

    setAddingToCart(true);
    try {
      const existingCart = await getCartFromStorage();
      const cartItemId = `${product.id}-${selectedSize}-${selectedColor ?? 'default'}`;

      const existingIndex = existingCart.findIndex((item) => item.id === cartItemId);

      let updatedCart: readonly CartItem[];
      if (existingIndex >= 0) {
        updatedCart = existingCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          product_id: product.id,
          title: product.title,
          brand: product.brand ?? 'Unknown',
          price: product.price,
          size: selectedSize,
          color: selectedColor ?? 'Default',
          image: product.images && product.images.length > 0 ? (product.images[0] as string) : null,
          quantity: 1,
        };
        updatedCart = [...existingCart, newItem];
      }

      await saveCartToStorage(updatedCart);
      Alert.alert('Added to Cart', `${product.title} has been added to your cart.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
      console.error('Add to cart failed:', error);
    } finally {
      setAddingToCart(false);
    }
  }, [product, selectedSize, selectedColor]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backArrow}>{'\u2039'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </View>
    );
  }

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [null, null, null, null]; // placeholder slides

  const sizes = product.sizes ?? MOCK_PRODUCT.sizes;
  const productColors = product.colors ?? MOCK_PRODUCT.colors;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>{'\u2039'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>{'\u2026'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((img, index) => (
            <View
              key={`image-${index}`}
              style={[styles.imageSlide, { backgroundColor: colors.slate }]}
            >
              {img ? (
                <Image source={{ uri: img as string }} style={styles.imageSlide} resizeMode="cover" />
              ) : (
                <Text style={styles.imagePlaceholder}>
                  {(product.brand ?? 'U').charAt(0)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                currentImageIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.brand ?? 'Unknown'}</Text>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(product.price)}
            </Text>
            {product.compare_at_price ? (
              <Text style={styles.comparePrice}>
                {formatPrice(product.compare_at_price)}
              </Text>
            ) : null}
          </View>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>SIZE</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sizesContainer}
              >
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size as string}
                    style={[
                      styles.sizePill,
                      selectedSize === size && styles.sizePillActive,
                    ]}
                    onPress={() => setSelectedSize(size as string)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === size && styles.sizeTextActive,
                      ]}
                    >
                      {size as string}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Color Selector */}
          {productColors.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>COLOR</Text>
                <Text style={styles.selectedColorName}>{selectedColor}</Text>
              </View>
              <View style={styles.colorsContainer}>
                {productColors.map((colorName) => (
                  <TouchableOpacity
                    key={colorName as string}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor:
                          COLOR_HEX_MAP[colorName as string] ?? colors.slate,
                      },
                      selectedColor === colorName && styles.colorCircleActive,
                    ]}
                    onPress={() => setSelectedColor(colorName as string)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Description */}
          {product.description && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              </View>
              <Text style={styles.description}>{product.description}</Text>
            </>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlistToggle}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.wishlistIcon,
              isWishlisted && styles.wishlistIconActive,
            ]}
          >
            {isWishlisted ? '\u2665' : '\u2661'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addToCartButton, addingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          activeOpacity={0.8}
          disabled={addingToCart}
        >
          <Text style={styles.addToCartText}>
            {addingToCart ? 'ADDING...' : 'ADD TO CART'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
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
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.smoke,
    opacity: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate,
  },
  dotActive: {
    backgroundColor: colors.yellow,
    width: 24,
  },
  infoContainer: {
    paddingHorizontal: spacing.md,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.yellow,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    marginTop: spacing.xs,
    lineHeight: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
  },
  comparePrice: {
    fontSize: 18,
    color: colors.smoke,
    textDecorationLine: 'line-through',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  selectedColorName: {
    fontSize: 13,
    color: colors.smoke,
    fontWeight: '600',
  },
  sizesContainer: {
    gap: spacing.sm,
  },
  sizePill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate,
    marginRight: spacing.sm,
  },
  sizePillActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.smoke,
  },
  sizeTextActive: {
    color: colors.black,
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: colors.yellow,
    borderWidth: 3,
  },
  description: {
    fontSize: 14,
    color: colors.smoke,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: colors.slate,
  },
  wishlistButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    fontSize: 24,
    color: colors.white,
  },
  wishlistIconActive: {
    color: '#EF4444',
  },
  addToCartButton: {
    flex: 1,
    height: 56,
    backgroundColor: colors.yellow,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 1,
  },
});
