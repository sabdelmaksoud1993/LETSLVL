import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatMessage {
  readonly id: string;
  readonly user: string;
  readonly message: string;
  readonly isBid?: boolean;
}

const STREAM = {
  id: '1',
  title: 'Supreme Drop Unboxing - Rare Pieces!',
  seller: 'HypeKing',
  viewers: 1243,
  currentBid: 450,
  bidCount: 23,
  timeLeft: 45,
  currentItem: 'Supreme Box Logo Tee FW24',
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
  const { id } = useLocalSearchParams();
  const [chatMessages, setChatMessages] = useState<readonly ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(STREAM.timeLeft);
  const chatRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = () => {
    if (chatInput.trim().length === 0) return;
    const newMessage: ChatMessage = {
      id: String(chatMessages.length + 1),
      user: 'You',
      message: chatInput.trim(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput('');
  };

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

  return (
    <View style={styles.container}>
      {/* Video Placeholder (Full Screen Background) */}
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
                  {STREAM.seller.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.sellerName}>{STREAM.seller}</Text>
                <Text style={styles.streamTitle} numberOfLines={1}>
                  {STREAM.title}
                </Text>
              </View>
            </View>

            <View style={styles.topRight}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <View style={styles.viewerBadge}>
                <Text style={styles.viewerIcon}>{'\u1F441'}</Text>
                <Text style={styles.viewerText}>
                  {STREAM.viewers.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Spacer to push content down */}
        <View style={styles.spacer} />

        {/* Auction Panel */}
        <View style={styles.auctionPanel}>
          <View style={styles.auctionHeader}>
            <Text style={styles.auctionItemName}>{STREAM.currentItem}</Text>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          <View style={styles.auctionRow}>
            <View>
              <Text style={styles.bidLabel}>CURRENT BID</Text>
              <Text style={styles.bidAmount}>${STREAM.currentBid}</Text>
              <Text style={styles.bidCount}>{STREAM.bidCount} bids</Text>
            </View>
            <TouchableOpacity style={styles.bidButton} activeOpacity={0.8}>
              <Text style={styles.bidButtonText}>
                BID ${STREAM.currentBid + 25}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={chatRef}
            data={chatMessages}
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
  sellerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  streamTitle: {
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
  viewerIcon: {
    fontSize: 12,
    color: colors.white,
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
  bidCount: {
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
