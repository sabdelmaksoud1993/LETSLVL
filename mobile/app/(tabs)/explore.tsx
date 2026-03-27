import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>EXPLORE</Text>
      <Text style={styles.sub}>Browse categories and discover new drops</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 16 },
  title: { fontSize: 28, fontWeight: "800", color: colors.white, marginBottom: 8 },
  sub: { fontSize: 14, color: colors.smoke },
});
