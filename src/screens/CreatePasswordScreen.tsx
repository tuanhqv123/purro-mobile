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
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useTranslation } from '@/utils/i18n';
import { useProtectedScreen } from '@/hooks/security';
import { apisWallet, apisLock } from '@/core/apis';
import type { CreatePasswordScreenProps } from '@/types/navigation';
import { FormInput } from '@/components/FormInput';
import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';

// Progress Indicator Component
const ProgressIndicator = () => (
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
  useTranslation();
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

  // Pre-warm vault và HD operations ngay khi component mount
  useEffect(() => {
    const preWarmOperations = async () => {
      try {
        // Pre-warm vault
        await apisLock.unlockWallet('');
      } catch (e) {
        // Expected to fail, but vault is now warmed up
      }

      try {
        // Pre-warm HD operations bằng cách tạo dummy HD key
        const dummyMnemonic =
          'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        const seed = bip39.mnemonicToSeedSync(dummyMnemonic);
        HDKey.fromMasterSeed(seed);
        console.log('✅ HD operations pre-warmed');
      } catch (e) {
        // Ignore errors, just for warming up
      }
    };

    preWarmOperations();
  }, []);

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isPasswordValid = password.length >= 8;
  const canContinue =
    passwordsMatch && isPasswordValid && confirmPassword.length > 0;

  const handleCreateWallet = async () => {
    if (!canContinue) return;

    setIsCreating(true);

    try {
      // Import wallet from mnemonic (this will create and persist wallet)
      // Vault đã được pre-warmed trong useEffect
      console.time('🏗️ Total Create Wallet');
      await apisWallet.importWallet(mnemonic, password);
      console.timeEnd('🏗️ Total Create Wallet');

      // Navigate to success screen
      navigation.navigate('WalletSuccess');
    } catch (error) {
      console.error('Error creating wallet:', error);
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
        backgroundColor={Colors.background.primary}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.content}>
          {/* Progress Indicator */}
          <ProgressIndicator />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  progressContainer: {
    width: 240,
    marginTop: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 3,
  },
  progressStep: {
    flex: 1,
    height: 3,
    backgroundColor: '#494F5B',
    borderRadius: 999,
  },
  progressActive: {
    backgroundColor: Colors.brand.primary,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
    width: 335,
  },
  subtitle: {
    ...Typography.styles.button,
    color: Colors.text.secondary,
    textAlign: 'center',
    width: 335,
  },
  inputsContainer: {
    width: '100%',
    gap: 16,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  continueButtonTextDisabled: {
    color: Colors.text.secondary,
  },
});

export default CreatePasswordScreen;
