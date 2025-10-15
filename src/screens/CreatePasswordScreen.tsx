import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { useProtectedScreen } from '@/hooks/security';
import { apisWallet } from '@/core/apis';
import type { CreatePasswordScreenProps } from '@/types/navigation';
import { FormInput } from '@/components/FormInput';
import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';

// Progress Indicator Component
const ProgressIndicator = ({ styles }: { styles: any }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={styles.progressStep} />
    </View>
  </View>
);

// Clean component - removed duplicate PasswordInput component

const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { mnemonic } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState<
    'password' | 'confirm' | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);

  const confirmPasswordRef = useRef<TextInput | null>(null);

  // Enable screenshot prevention for this screen
  useProtectedScreen('CreateWallet');

  // Pre-warm HD operations ngay khi component mount
  useEffect(() => {
    const preWarmOperations = async () => {
      try {
        const dummyMnemonic =
          'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        const seed = bip39.mnemonicToSeedSync(dummyMnemonic);
        HDKey.fromMasterSeed(seed);
      } catch (e) {
        // Ignore pre-warm errors
      }
    };

    preWarmOperations();
  }, []);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isPasswordValid = password.length >= 8;
  const canContinue =
    passwordsMatch && isPasswordValid && confirmPassword.length > 0;

  const handleCreateWallet = async () => {
    if (!canContinue || isCreating) return;

    setIsCreating(true);

    try {
      await apisWallet.importWallet(mnemonic, password);
      navigation.navigate('WalletSuccess');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error && error.message.includes('Native module')
          ? "Failed to create wallet. If you're using Chrome debugger, please disable it and restart the app. This app requires native modules that don't work with Chrome debugging."
          : error instanceof Error
          ? error.message
          : 'Failed to create wallet. Please try again.',
        [{ text: 'OK', style: 'default' }],
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.background.primary}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.content}>
          {/* Progress Indicator */}
          <ProgressIndicator styles={styles} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create password</Text>
            <Text style={styles.subtitle}>Your Gateway to Hyperliquid</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              isPassword={true}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              isFocused={focusedField === 'password'}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              warningMessage={
                password.length > 0 && !isPasswordValid
                  ? 'Password must be at least 8 characters'
                  : undefined
              }
            />

            <FormInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              isPassword={true}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              isFocused={focusedField === 'confirm'}
              inputRef={confirmPasswordRef}
              onSubmitEditing={handleCreateWallet}
              errorMessage={
                confirmPassword.length > 0 && password !== confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
            />
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!canContinue || isCreating) && styles.continueButtonDisabled,
            ]}
            onPress={handleCreateWallet}
            disabled={!canContinue || isCreating}
          >
            <Text
              style={[
                styles.continueButtonText,
                (!canContinue || isCreating) &&
                  styles.continueButtonTextDisabled,
              ]}
            >
              {isCreating ? 'Creating Wallet...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    keyboardAvoid: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      justifyContent: 'space-between',
      paddingBottom: Spacing.xxl,
    },
    progressContainer: {
      width: 240,
      marginTop: Spacing.lg,
    },
    progressBar: {
      flexDirection: 'row',
      gap: 4,
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.full,
      height: 3,
    },
    progressStep: {
      flex: 1,
      height: 3,
      backgroundColor: theme.neutral.gray[500],
      borderRadius: BorderRadius.full,
    },
    progressActive: {
      backgroundColor: theme.primary[400],
    },
    header: {
      alignItems: 'center',
      gap: Spacing.md,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      width: 335,
    },
    subtitle: {
      ...Typography.button,
      color: theme.text.secondary,
      textAlign: 'center',
      width: 335,
    },
    inputsContainer: {
      width: '100%',
      gap: Spacing.md,
    },
    bottomSection: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    continueButton: {
      backgroundColor: theme.primary[400],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      width: '100%',
    },
    continueButtonDisabled: {
      backgroundColor: theme.background.secondary,
    },
    continueButtonText: {
      ...Typography.label16,
      fontWeight: '500',
      color: theme.text.primary,
    },
    continueButtonTextDisabled: {
      color: theme.text.secondary,
    },
  });

export default CreatePasswordScreen;
