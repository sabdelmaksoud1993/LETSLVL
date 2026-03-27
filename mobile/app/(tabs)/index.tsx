import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            LET'S <Text style={styles.logoAccent}>LVL</Text>
          </Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>BUILT FOR{"\n"}THE BOLD.</Text>
          <Text style={styles.heroSub}>
            Dubai's boldest destination for fashion, merchandise, and live
            auctions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
          <Text style={styles.placeholder}>Products loading from Supabase...</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LIVE NOW</Text>
          <Text style={styles.placeholder}>Live streams coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  scroll: { padding: 16 },
  header: { marginBottom: 24 },
  logo: { fontSize: 28, fontWeight: "800", color: colors.white },
  logoAccent: { color: colors.yellow },
  hero: {
    backgroundColor: colors.carbon,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.white,
    lineHeight: 42,
    marginBottom: 8,
  },
  heroSub: { fontSize: 14, color: colors.smoke, lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 1,
    marginBottom: 12,
  },
  placeholder: { fontSize: 14, color: colors.smoke },
});
