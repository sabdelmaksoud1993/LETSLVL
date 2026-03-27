import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRODUCT = {
  id: '1',
  title: 'Air Jordan 1 Retro High OG',
  brand: 'Nike',
  price: 189.99,
  images: [
    { id: '1', color: colors.slate },
    { id: '2', color: '#3B3B3B' },
    { id: '3', color: '#4A4A4A' },
    { id: '4', color: '#333333' },
  ],
  sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
  colors: [
    { name: 'Chicago', hex: '#C41E3A' },
    { name: 'Bred', hex: '#1A1A1A' },
    { name: 'Royal', hex: '#2563EB' },
    { name: 'Shadow', hex: '#6B7280' },
  ],
  description:
    'The Air Jordan 1 Retro High OG brings back the iconic silhouette that started it all. Premium leather upper with classic colorway, Nike Air cushioning, and the unmistakable Wings logo. A timeless sneaker that transcends the court and defines street culture.',
  seller: 'SneakerVault',
  rating: 4.8,
  reviews: 234,
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0].name);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );
    setCurrentImageIndex(index);
  };

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
          {PRODUCT.images.map((img) => (
            <View
              key={img.id}
              style={[styles.imageSlide, { backgroundColor: img.color }]}
            >
              <Text style={styles.imagePlaceholder}>
                {PRODUCT.brand.charAt(0)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {PRODUCT.images.map((img, index) => (
            <View
              key={img.id}
              style={[
                styles.dot,
                currentImageIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{PRODUCT.brand}</Text>
          <Text style={styles.title}>{PRODUCT.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              $
              {PRODUCT.price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>{'\u2605'}</Text>
              <Text style={styles.ratingText}>
                {PRODUCT.rating} ({PRODUCT.reviews})
              </Text>
            </View>
          </View>

          {/* Size Selector */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>SIZE</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sizesContainer}
          >
            {PRODUCT.sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizePill,
                  selectedSize === size && styles.sizePillActive,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size && styles.sizeTextActive,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Color Selector */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>COLOR</Text>
            <Text style={styles.selectedColorName}>{selectedColor}</Text>
          </View>
          <View style={styles.colorsContainer}>
            {PRODUCT.colors.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color.hex },
                  selectedColor === color.name && styles.colorCircleActive,
                ]}
                onPress={() => setSelectedColor(color.name)}
              />
            ))}
          </View>

          {/* Description */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          </View>
          <Text style={styles.description}>{PRODUCT.description}</Text>

          {/* Seller */}
          <View style={styles.sellerSection}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {PRODUCT.seller.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.sellerName}>{PRODUCT.seller}</Text>
              <Text style={styles.sellerLabel}>Verified Seller</Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => setIsWishlisted((prev) => !prev)}
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
        <TouchableOpacity style={styles.addToCartButton} activeOpacity={0.8}>
          <Text style={styles.addToCartText}>ADD TO CART</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    fontSize: 16,
    color: colors.yellow,
  },
  ratingText: {
    fontSize: 14,
    color: colors.smoke,
    fontWeight: '600',
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
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  sellerLabel: {
    fontSize: 12,
    color: colors.smoke,
    marginTop: 2,
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
  addToCartText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 1,
  },
});
