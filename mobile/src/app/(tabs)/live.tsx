import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';
import { getStreams, type Stream } from '../../lib/data';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  'All',
  'Trading Card Games',
  'Sports Cards',
  'Fashion',
  'Toys',
  'Sneakers',
  'Watches',
];

const MOCK_STREAMS = [
  { id: '1', title: 'Pokemon Booster Box Opening!', seller_name: 'CardMaster', viewer_count: 2431, category: 'Trading Card Games', status: 'live' },
  { id: '2', title: 'Rare Air Jordan Collection Auction', seller_name: 'SneakerVault', viewer_count: 1876, category: 'Fashion', status: 'live' },
  { id: '3', title: 'Topps Chrome Baseball Breaks', seller_name: 'SportsCollector', viewer_count: 943, category: 'Sports Cards', status: 'live' },
  { id: '4', title: 'Vintage Star Wars Toys Live Sale', seller_name: 'RetroToys', viewer_count: 654, category: 'Toys', status: 'live' },
  { id: '5', title: 'Supreme x Louis Vuitton Drops', seller_name: 'HypeKing', viewer_count: 3210, category: 'Fashion', status: 'live' },
  { id: '6', title: "Yu-Gi-Oh! Ghost Rare Hunt", seller_name: 'DuelMaster', viewer_count: 1122, category: 'Trading Card Games', status: 'live' },
  { id: '7', title: 'Rolex & AP Watch Showcase', seller_name: 'WatchDealer', viewer_count: 4500, category: 'Watches', status: 'live' },
  { id: '8', title: 'Nike Dunk Low Mystery Box', seller_name: 'KickzKing', viewer_count: 789, category: 'Sneakers', status: 'live' },
];

type StreamItem = Stream | typeof MOCK_STREAMS[0];

export default function LiveScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [streams, setStreams] = useState<readonly StreamItem[]>(MOCK_STREAMS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStreams = useCallback(async () => {
    try {
      const data = await getStreams({ status: 'live' });
      if (data.length > 0) {
        setStreams(data);
      }
    } catch (error) {
      console.error('Failed to fetch streams:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();

    // Subscribe to realtime changes on streams table
    const channel = supabase
      .channel('streams-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'streams' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newStream = payload.new as Stream;
            if (newStream.status === 'live') {
              setStreams((prev) => [newStream, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Stream;
            setStreams((prev) =>
              prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setStreams((prev) => prev.filter((s) => s.id !== deletedId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStreams]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStreams();
    setRefreshing(false);
  }, [fetchStreams]);

  const filteredStreams =
    selectedCategory === 'All'
      ? streams
      : streams.filter((s) => s.category === selectedCategory);

  const renderStreamCard = ({ item }: { item: StreamItem }) => (
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
            {(item.viewer_count ?? 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.cardInfo}>
        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>
              {(item.seller_name ?? 'U').charAt(0)}
            </Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.streamTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.sellerName}>{item.seller_name ?? 'Unknown'}</Text>
          </View>
        </View>
        {item.category ? (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LIVE</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIVE</Text>
        <View style={styles.liveCount}>
          <View style={styles.headerLiveDot} />
          <Text style={styles.liveCountText}>
            {filteredStreams.length} streams
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
        data={filteredStreams as StreamItem[]}
        renderItem={renderStreamCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
