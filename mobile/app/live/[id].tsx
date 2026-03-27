import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '../../src/theme';
import { useAuth } from '../../src/lib/auth-context';
import { getStream, type Stream } from '../../src/lib/data';
import { supabase } from '../../src/lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatMessage {
  readonly id: string;
  readonly user: string;
  readonly message: string;
  readonly isBid?: boolean;
}

// Fallback mock data
const MOCK_STREAM = {
  id: '1',
  title: 'Supreme Drop Unboxing - Rare Pieces!',
  seller_name: 'HypeKing',
  viewer_count: 1243,
};

const INITIAL_CHAT: readonly ChatMessage[] = [
  { id: '1', user: 'SneakerFan99', message: 'This is fire!' },
  { id: '2', user: 'HypeCollector', message: '$400 bid', isBid: true },
  { id: '3', user: 'StreetStyle', message: 'Need that box logo' },
  { id: '4', user: 'VintageVibes', message: 'What size is that?' },
  { id: '5', user: 'LuxeDeals', message: '$420 bid', isBid: true },
  { id: '6', user: 'FashionKing', message: 'Ship to UAE?' },
  { id: '7', user: 'RareFinds', message: 'Authenticate pls' },
  { id: '8', user: 'DroppedIn', message: '$450 bid!', isBid: true },
  { id: '9', user: 'NewCollector', message: 'Is this DS?' },
  { id: '10', user: 'HighBidder', message: "Let's gooo" },
];

export default function StreamViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<readonly ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [currentBid, setCurrentBid] = useState(450);
  const [bidCount, setBidCount] = useState(23);
  const [timeLeft, setTimeLeft] = useState(45);
  const chatRef = useRef<FlatList>(null);

  const fetchStream = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getStream(id);
      if (data) {
        setStream(data);
        setViewerCount(data.viewer_count ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch stream:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Realtime subscriptions for chat and bids
  useEffect(() => {
    if (!id) return;

    // Subscribe to chat messages
    const chatChannel = supabase
      .channel(`chat-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `stream_id=eq.${id}`,
        },
        (payload) => {
          const msg = payload.new as {
            id: string;
            user_name: string;
            message: string;
            is_bid: boolean;
          };
          const newMessage: ChatMessage = {
            id: msg.id,
            user: msg.user_name ?? 'Anonymous',
            message: msg.message,
            isBid: msg.is_bid ?? false,
          };
          setChatMessages((prev) => [...prev, newMessage]);
        },
      )
      .subscribe();

    // Subscribe to bid updates
    const bidChannel = supabase
      .channel(`bids-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `stream_id=eq.${id}`,
        },
        (payload) => {
          const bid = payload.new as { amount: number };
          if (bid.amount > currentBid) {
            setCurrentBid(bid.amount);
            setBidCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    // Subscribe to viewer count changes
    const streamChannel = supabase
      .channel(`stream-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'streams',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as { viewer_count: number };
          setViewerCount(updated.viewer_count ?? 0);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(bidChannel);
      supabase.removeChannel(streamChannel);
    };
  }, [id, currentBid]);

  const sendMessage = useCallback(async () => {
    if (chatInput.trim().length === 0) return;

    const userName = profile?.full_name ?? user?.email ?? 'You';

    // Optimistic local update
    const newMessage: ChatMessage = {
      id: String(Date.now()),
      user: userName,
      message: chatInput.trim(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');

    // Persist to Supabase if logged in
    if (user && id) {
      try {
        await supabase.from('chat_messages').insert({
          stream_id: id,
          user_id: user.id,
          user_name: userName,
          message: newMessage.message,
          is_bid: false,
        });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }, [chatInput, user, profile, id]);

  const handleBid = useCallback(async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const bidAmount = currentBid + 25;

    // Optimistic local update
    setCurrentBid(bidAmount);
    setBidCount((prev) => prev + 1);

    const userName = profile?.full_name ?? user.email ?? 'You';
    const bidMessage: ChatMessage = {
      id: String(Date.now()),
      user: userName,
      message: `$${bidAmount} bid!`,
      isBid: true,
    };
    setChatMessages((prev) => [...prev, bidMessage]);

    // Persist to Supabase
    if (id) {
      try {
        await supabase.from('bids').insert({
          stream_id: id,
          user_id: user.id,
          amount: bidAmount,
        });
        await supabase.from('chat_messages').insert({
          stream_id: id,
          user_id: user.id,
          user_name: userName,
          message: `$${bidAmount} bid!`,
          is_bid: true,
        });
      } catch (error) {
        console.error('Failed to place bid:', error);
      }
    }
  }, [user, profile, id, currentBid, router]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.chatMessage, item.isBid && styles.bidMessage]}>
      <Text style={[styles.chatUser, item.isBid && styles.bidUser]}>
        {item.user}
      </Text>
      <Text style={[styles.chatText, item.isBid && styles.bidText]}>
        {item.message}
      </Text>
    </View>
  );

  const sellerName = stream?.seller_name ?? MOCK_STREAM.seller_name;
  const streamTitle = stream?.title ?? MOCK_STREAM.title;
  const displayViewerCount = viewerCount || MOCK_STREAM.viewer_count;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.videoBackground}>
          <ActivityIndicator size="large" color={colors.yellow} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Placeholder */}
      <View style={styles.videoBackground}>
        <Text style={styles.videoPlaceholder}>LIVE STREAM</Text>
        <Text style={styles.videoSubtext}>Video feed goes here</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Bar */}
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backArrow}>{'\u2039'}</Text>
            </TouchableOpacity>

            <View style={styles.streamInfo}>
              <View style={styles.sellerBadge}>
                <Text style={styles.sellerInitial}>
                  {sellerName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.sellerNameText}>{sellerName}</Text>
                <Text style={styles.streamTitleText} numberOfLines={1}>
                  {streamTitle}
                </Text>
              </View>
            </View>

            <View style={styles.topRight}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <View style={styles.viewerBadge}>
                <Text style={styles.viewerText}>
                  {displayViewerCount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Auction Panel */}
        <View style={styles.auctionPanel}>
          <View style={styles.auctionHeader}>
            <Text style={styles.auctionItemName}>Current Auction</Text>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          <View style={styles.auctionRow}>
            <View>
              <Text style={styles.bidLabel}>CURRENT BID</Text>
              <Text style={styles.bidAmount}>${currentBid}</Text>
              <Text style={styles.bidCountText}>{bidCount} bids</Text>
            </View>
            <TouchableOpacity
              style={styles.bidButton}
              activeOpacity={0.8}
              onPress={handleBid}
            >
              <Text style={styles.bidButtonText}>
                BID ${currentBid + 25}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={chatRef}
            data={chatMessages as ChatMessage[]}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              chatRef.current?.scrollToEnd({ animated: true })
            }
          />
        </View>

        {/* Chat Input */}
        <SafeAreaView edges={['bottom']} style={styles.chatInputContainer}>
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Say something..."
              placeholderTextColor={colors.smoke}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
            >
              <Text style={styles.sendButtonText}>{'\u27A4'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.carbon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.slate,
    letterSpacing: 4,
  },
  videoSubtext: {
    fontSize: 14,
    color: colors.slate,
    marginTop: spacing.sm,
  },
  overlay: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
  streamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sellerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.black,
  },
  sellerNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  streamTitleText: {
    fontSize: 11,
    color: colors.smoke,
    maxWidth: 160,
  },
  topRight: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  viewerText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  // Auction Panel
  auctionPanel: {
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  auctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  auctionItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
  },
  timerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  auctionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.smoke,
    letterSpacing: 1,
  },
  bidAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.yellow,
  },
  bidCountText: {
    fontSize: 12,
    color: colors.smoke,
  },
  bidButton: {
    backgroundColor: colors.yellow,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
  },
  bidButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 0.5,
  },
  // Chat
  chatContainer: {
    height: SCREEN_HEIGHT * 0.25,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  chatMessage: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  bidMessage: {
    backgroundColor: 'rgba(245,197,24,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.3)',
  },
  chatUser: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.yellow,
  },
  bidUser: {
    color: colors.yellow,
  },
  chatText: {
    fontSize: 13,
    color: colors.white,
  },
  bidText: {
    color: colors.yellow,
    fontWeight: '700',
  },
  chatInputContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.white,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    color: colors.black,
  },
});
