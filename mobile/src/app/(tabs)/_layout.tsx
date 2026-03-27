import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text
        style={[
          styles.tabIcon,
          { color: focused ? colors.yellow : colors.smoke },
        ]}
      >
        {icon}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          { color: focused ? colors.yellow : colors.smoke },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

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
            <TabIcon icon="⌂" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📡" label="Live" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛒" label="Cart" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="♥" label="Wishlist" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Account" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.carbon,
    borderTopColor: colors.slate,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
