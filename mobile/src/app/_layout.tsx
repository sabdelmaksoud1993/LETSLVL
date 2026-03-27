import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

export default function RootLayout() {
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
