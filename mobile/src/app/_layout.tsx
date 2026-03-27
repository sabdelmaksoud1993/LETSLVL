import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { AuthProvider, useAuth } from '../lib/auth-context';

function AppContent() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in + scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [fadeAnim, scaleAnim, pulseAnim]);

  useEffect(() => {
    if (!loading) {
      // Auth loaded, fade out splash
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, fadeAnim]);

  if (showSplash) {
    return (
      <View style={splashStyles.container}>
        <StatusBar style="light" />
        <Animated.View
          style={[
            splashStyles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text style={[splashStyles.logoLets, { opacity: pulseAnim }]}>
            {"LET'S"}
          </Animated.Text>
          <Animated.Text style={[splashStyles.logoLvl, { opacity: pulseAnim }]}>
            LVL
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.black },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="live/[id]"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth/register"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoLets: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  logoLvl: {
    fontSize: 64,
    fontWeight: '900',
    color: '#F5C518',
    letterSpacing: 12,
    marginTop: -4,
  },
});
