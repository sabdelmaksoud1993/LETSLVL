import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../theme';
import { formatPrice } from '../../lib/utils';
import {
  getCartFromStorage,
  saveCartToStorage,
  type CartItem,
} from '../../lib/data';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<readonly CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      const items = await getCartFromStorage();
      setCartItems(items);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = useCallback(
    async (id: string, delta: number) => {
      const updated = cartItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0);

      setCartItems(updated);
      await saveCartToStorage(updated);
    },
    [cartItems],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const updated = cartItems.filter((item) => item.id !== id);
      setCartItems(updated);
      await saveCartToStorage(updated);
    },
    [cartItems],
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = cartItems.length > 0 ? 15.0 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CART</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CART</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>&#x1F6D2;</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore products and start adding items
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CART</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            {/* Product Image */}
            <View style={styles.itemImage}>
              <Text style={styles.imagePlaceholder}>
                {item.brand.charAt(0)}
              </Text>
            </View>

            {/* Product Details */}
            <View style={styles.itemDetails}>
              <Text style={styles.itemBrand}>{item.brand}</Text>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.itemVariant}>
                {item.size} / {item.color}
              </Text>

              <View style={styles.itemBottom}>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Text style={styles.removeButtonText}>&#x2715;</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(shipping)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(total)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.checkoutButton} activeOpacity={0.8}>
          <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 64,
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
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.carbon,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.slate,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.smoke,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.yellow,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginTop: 2,
  },
  itemVariant: {
    fontSize: 12,
    color: colors.smoke,
    marginTop: 4,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: colors.smoke,
  },
  orderSummary: {
    backgroundColor: colors.carbon,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.smoke,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.yellow,
  },
  checkoutContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: colors.slate,
  },
  checkoutButton: {
    backgroundColor: colors.yellow,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 1,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
