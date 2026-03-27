import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';

const CATEGORIES = [
  'All',
  'Trading Card Games',
  'Sports Cards',
  'Fashion',
  'Toys',
  'Sneakers',
  'Watches',
];

const LIVE_STREAMS = [
  {
    id: '1',
    title: 'Pokemon Booster Box Opening!',
    seller: 'CardMaster',
    sellerAvatar: 'C',
    viewers: 2431,
    category: 'Trading Card Games',
    isLive: true,
  },
  {
    id: '2',
    title: 'Rare Air Jordan Collection Auction',
    seller: 'SneakerVault',
    sellerAvatar: 'S',
    viewers: 1876,
    category: 'Fashion',
    isLive: true,
  },
  {
    id: '3',
    title: 'Topps Chrome Baseball Breaks',
    seller: 'SportsCollector',
    sellerAvatar: 'SC',
    viewers: 943,
    category: 'Sports Cards',
    isLive: true,
  },
  {
    id: '4',
    title: 'Vintage Star Wars Toys Live Sale',
    seller: 'RetroToys',
    sellerAvatar: 'R',
    viewers: 654,
    category: 'Toys',
    isLive: true,
  },
  {
    id: '5',
    title: 'Supreme x Louis Vuitton Drops',
    seller: 'HypeKing',
    sellerAvatar: 'H',
    viewers: 3210,
    category: 'Fashion',
    isLive: true,
  },
  {
    id: '6',
    title: 'Yu-Gi-Oh! Ghost Rare Hunt',
    seller: 'DuelMaster',
    sellerAvatar: 'D',
    viewers: 1122,
    category: 'Trading Card Games',
    isLive: true,
  },
  {
    id: '7',
    title: 'Rolex & AP Watch Showcase',
    seller: 'WatchDealer',
    sellerAvatar: 'W',
    viewers: 4500,
    category: 'Watches',
    isLive: true,
  },
  {
    id: '8',
    title: 'Nike Dunk Low Mystery Box',
    seller: 'KickzKing',
    sellerAvatar: 'K',
    viewers: 789,
    category: 'Sneakers',
    isLive: true,
  },
];

export default function LiveScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredStreams =
    selectedCategory === 'All'
      ? LIVE_STREAMS
      : LIVE_STREAMS.filter((s) => s.category === selectedCategory);

  const renderStreamCard = ({
    item,
  }: {
    item: (typeof LIVE_STREAMS)[0];
  }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => router.push(`/live/${item.id}`)}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Text style={styles.viewerIcon}>&#x1F441;</Text>
          <Text style={styles.viewerText}>
            {item.viewers.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>
              {item.sellerAvatar}
            </Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.streamTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.sellerName}>{item.seller}</Text>
          </View>
        </View>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIVE</Text>
        <View style={styles.liveCount}>
          <View style={styles.headerLiveDot} />
          <Text style={styles.liveCountText}>
            {LIVE_STREAMS.length} streams
          </Text>
        </View>
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
                styles.categoryPillText,
                selectedCategory === cat && styles.categoryPillTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stream List */}
      <FlatList
        data={filteredStreams}
        renderItem={renderStreamCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  liveCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveCountText: {
    fontSize: 13,
    color: colors.smoke,
    fontWeight: '600',
  },
  categoriesContainer: {
    maxHeight: 44,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.carbon,
    borderWidth: 1,
    borderColor: colors.slate,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.smoke,
  },
  categoryPillTextActive: {
    color: colors.black,
  },
  listContent: {
    padding: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  streamCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 200,
    backgroundColor: colors.slate,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  liveDot: {
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
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  viewerIcon: {
    fontSize: 12,
  },
  viewerText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  cardInfo: {
    padding: spacing.md,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.black,
  },
  sellerInfo: {
    flex: 1,
  },
  streamTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  sellerName: {
    fontSize: 13,
    color: colors.smoke,
    marginTop: 2,
  },
  categoryTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
});
