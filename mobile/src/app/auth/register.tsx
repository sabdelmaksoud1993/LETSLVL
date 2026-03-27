import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '../../theme';

const COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Kuwait',
  'Bahrain',
  'Qatar',
  'Oman',
  'Egypt',
  'Jordan',
];

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>{'\u2039'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Join the LET&apos;S LVL community and start shopping
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.smoke}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.smoke}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+971 50 123 4567"
                placeholderTextColor={colors.smoke}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>COUNTRY</Text>
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryPicker((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.countrySelectorText,
                    !country && styles.placeholderText,
                  ]}
                >
                  {country || 'Select your country'}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showCountryPicker ? '\u25B2' : '\u25BC'}
                </Text>
              </TouchableOpacity>
              {showCountryPicker && (
                <View style={styles.countryDropdown}>
                  {COUNTRIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.countryOption,
                        country === c && styles.countryOptionActive,
                      ]}
                      onPress={() => {
                        setCountry(c);
                        setShowCountryPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.countryOptionText,
                          country === c && styles.countryOptionTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min 8 characters"
                  placeholderTextColor={colors.smoke}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    color: colors.smoke,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.smoke,
    letterSpacing: 1,
  },
  input: {
    height: 52,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate,
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.white,
  },
  showPasswordButton: {
    paddingHorizontal: spacing.md,
  },
  showPasswordText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.yellow,
    letterSpacing: 1,
  },
  countrySelector: {
    height: 52,
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.slate,
  },
  countrySelectorText: {
    fontSize: 16,
    color: colors.white,
  },
  placeholderText: {
    color: colors.smoke,
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.smoke,
  },
  countryDropdown: {
    backgroundColor: colors.carbon,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  countryOption: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate,
  },
  countryOptionActive: {
    backgroundColor: colors.yellow,
  },
  countryOptionText: {
    fontSize: 15,
    color: colors.white,
  },
  countryOptionTextActive: {
    color: colors.black,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: colors.yellow,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 12,
    color: colors.smoke,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.yellow,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: 14,
    color: colors.smoke,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.yellow,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
