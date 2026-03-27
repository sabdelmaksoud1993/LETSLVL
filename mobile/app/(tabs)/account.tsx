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
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/theme';
import { useAuth } from '../../src/lib/auth-context';
import { getUserOrders, getWishlist } from '../../src/lib/data';

const MENU_ITEMS = [
  { id: 'orders', label: 'My Orders', icon: '\uD83D\uDCE6' },
  { id: 'settings', label: 'Settings', icon: '\u2699\uFE0F' },
  { id: 'seller', label: 'Become a Seller', icon: '\uD83C\uDFEA' },
  { id: 'help', label: 'Help & Support', icon: '\u2753' },
];

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const [orders, wishlist] = await Promise.all([
        getUserOrders(user.id),
        getWishlist(user.id),
      ]);
      setOrderCount(orders.length);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Failed to load account stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, loadStats]);

  const getInitials = (): string => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getMemberSince = (): string => {
    if (user?.created_at) {
      const date = new Date(user.created_at);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'Recently';
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ACCOUNT</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ACCOUNT</Text>
        </View>
        <View style={styles.authContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>LVL</Text>
          </View>
          <Text style={styles.authTitle}>Join the community</Text>
          <Text style={styles.authSubtitle}>
            Sign in to access your orders, wishlist, and more
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>SIGN IN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ACCOUNT</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.userName}>
            {profile?.full_name ?? user.email ?? 'User'}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>
            Member since {getMemberSince()}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {statsLoading ? '-' : orderCount}
            </Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {statsLoading ? '-' : wishlistCount}
            </Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile?.role === 'seller' ? 'Seller' : 'Buyer'}
            </Text>
            <Text style={styles.statLabel}>Role</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuArrow}>{'\u203A'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>LET&apos;S LVL v1.0.0</Text>

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  // Auth State
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 2,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  authSubtitle: {
    fontSize: 14,
    color: colors.smoke,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  signInButton: {
    backgroundColor: colors.yellow,
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 1,
  },
  createAccountButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 1,
  },
  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.black,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: colors.smoke,
    marginTop: 4,
  },
  memberSince: {
    fontSize: 12,
    color: colors.smoke,
    marginTop: 4,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.carbon,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.yellow,
  },
  statLabel: {
    fontSize: 12,
    color: colors.smoke,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.slate,
  },
  // Menu
  menuSection: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.slate,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.smoke,
  },
  // Sign Out
  signOutButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.smoke,
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
