import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";

export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        MY <Text style={styles.accent}>ACCOUNT</Text>
      </Text>
      <Text style={styles.sub}>Sign in to manage your account, orders, and settings</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black, padding: 16 },
  title: { fontSize: 28, fontWeight: "800", color: colors.white, marginBottom: 8 },
  accent: { color: colors.yellow },
  sub: { fontSize: 14, color: colors.smoke },
});
