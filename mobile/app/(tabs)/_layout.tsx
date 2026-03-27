import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, Animated, useWindowDimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '../../src/theme';

// --------------------------------------------------------------------------
// SVG-like icon paths drawn with RN Views (lightweight, no vector dependency)
// --------------------------------------------------------------------------

function HomeIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* House shape */}
      <View style={{
        width: size * 0.8, height: size * 0.5,
        borderWidth: 2, borderColor: color, borderRadius: 3,
        marginTop: size * 0.2,
      }} />
      {/* Roof */}
      <View style={{
        position: 'absolute', top: 0,
        width: 0, height: 0,
        borderLeftWidth: size * 0.5, borderRightWidth: size * 0.5,
        borderBottomWidth: size * 0.35,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderBottomColor: color,
      }} />
      {/* Door */}
      <View style={{
        position: 'absolute', bottom: 0,
        width: size * 0.25, height: size * 0.28,
        borderWidth: 2, borderColor: color, borderBottomWidth: 0, borderRadius: 2,
      }} />
    </View>
  );
}

function ExploreIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 2, borderColor: color,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{
        width: size * 0.35, height: size * 0.35,
        borderRadius: 2,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  );
}

function LiveIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring */}
      <View style={{
        width: size * 0.9, height: size * 0.9,
        borderRadius: size * 0.45,
        borderWidth: 2, borderColor: color,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Inner ring */}
        <View style={{
          width: size * 0.55, height: size * 0.55,
          borderRadius: size * 0.275,
          borderWidth: 1.5, borderColor: color,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Center dot */}
          <View style={{
            width: size * 0.2, height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: color,
          }} />
        </View>
      </View>
    </View>
  );
}

function HeartIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.85, color, lineHeight: size * 1.1 }}>♡</Text>
    </View>
  );
}

function AccountIcon({ color, size }: { color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Head */}
      <View style={{
        width: size * 0.35, height: size * 0.35,
        borderRadius: size * 0.175,
        borderWidth: 2, borderColor: color,
        marginBottom: 2,
      }} />
      {/* Body arc */}
      <View style={{
        width: size * 0.6, height: size * 0.25,
        borderTopLeftRadius: size * 0.3,
        borderTopRightRadius: size * 0.3,
        borderWidth: 2, borderColor: color,
        borderBottomWidth: 0,
      }} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Pulsing red dot for LIVE tab
// --------------------------------------------------------------------------

function PulsingDot() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.dotContainer}>
      <Animated.View style={[styles.dotPing, { opacity: pulseAnim }]} />
      <View style={styles.dotSolid} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Tab icon wrapper
// --------------------------------------------------------------------------

function TabIcon({
  icon: Icon,
  label,
  focused,
  isLive,
}: {
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  focused: boolean;
  isLive?: boolean;
}) {
  const color = isLive && !focused ? '#F87171' : focused ? colors.yellow : colors.smoke;

  return (
    <View style={styles.tabIconContainer}>
      <View style={styles.iconWrapper}>
        <Icon color={focused ? colors.yellow : colors.smoke} size={24} />
        {isLive && <PulsingDot />}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          { color },
          isLive && { fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// --------------------------------------------------------------------------
// Tab Layout
// --------------------------------------------------------------------------

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.yellow,
        tabBarInactiveTintColor: colors.smoke,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={HomeIcon} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={LiveIcon} label="LIVE" focused={focused} isLive />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={ExploreIcon} label="Cart" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={HeartIcon} label="Wishlist" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={AccountIcon} label="Account" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.black,
    borderTopColor: colors.slate,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 10,
    paddingBottom: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    gap: 3,
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  dotContainer: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotPing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  dotSolid: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
