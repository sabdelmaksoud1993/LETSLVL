import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";

export default function WishlistScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        SAVED <Text style={styles.accent}>ITEMS</Text>
      </Text>
      <Text style={styles.sub}>Sign in to save your favorite items</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 16 },
  title: { fontSize: 28, fontWeight: "800", color: colors.white, marginBottom: 8 },
  accent: { color: colors.yellow },
  sub: { fontSize: 14, color: colors.smoke },
});
