import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";

export default function LiveScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          LET'S <Text style={styles.logoAccent}>LVL</Text>
        </Text>
        <Text style={styles.arabicLogo}>ليتس ال في ال</Text>
      </View>

      <View style={styles.badge}>
        <View style={styles.liveDot} />
        <Text style={styles.badgeText}>LIVE AUCTIONS</Text>
      </View>

      <Text style={styles.sub}>
        Scroll through live streams, bid on items, and buy instantly.
        Sellers go live on camera to showcase products in real-time.
      </Text>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>STREAMS LOADING...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { fontSize: 24, fontWeight: "800", color: colors.black },
  logoAccent: { color: colors.yellow },
  arabicLogo: { fontSize: 16, color: colors.smoke },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.live },
  badgeText: { fontSize: 18, fontWeight: "800", color: colors.black, letterSpacing: 1 },
  sub: { fontSize: 14, color: colors.smoke, lineHeight: 20, marginBottom: 24 },
  comingSoon: { flex: 1, justifyContent: "center", alignItems: "center" },
  comingSoonText: { fontSize: 14, color: colors.smoke, letterSpacing: 2 },
});
