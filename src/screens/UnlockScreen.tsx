import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { FormInput } from '@/components/FormInput';
import { useTranslation } from '@/utils/i18n';
import { apisLock, apisKeychain } from '@/core/apis';
import { useBiometrics } from '@/hooks/biometrics';
import type { UnlockScreenProps } from '@/types/navigation';

const UnlockScreen: React.FC<UnlockScreenProps> = ({ navigation }) => {
  useTranslation();
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [biometricAttempted, setBiometricAttempted] = useState(false);
  const [focusedField, setFocusedField] = useState<'password' | null>(null);
  const { computed, fetchBiometrics } = useBiometrics({ autoFetch: true });

  // Auto attempt biometric unlock if enabled
  useEffect(() => {
    const attemptBiometricUnlock = async () => {
      try {
        await fetchBiometrics();

        // Wait a bit for UI to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        // Pre-warm vault by attempting decrypt with dummy password
        // This will "heat up" the vault data in memory for faster subsequent access
        console.log('🔥 Pre-warming vault...');
        console.time('🔥 Vault Pre-warm');
        try {
          await apisLock.unlockWallet('');
        } catch (e) {
          // Expected to fail, but vault is now warmed up
          console.log('✅ Vault pre-warmed (expected failure)');
        }
        console.timeEnd('🔥 Vault Pre-warm');

        if (
          computed.isBiometricsEnabled &&
          !isUnlocking &&
          !biometricAttempted
        ) {
          console.log('🔐 Attempting biometric unlock...');
          setIsUnlocking(true);
          setErrorMessage('');

          try {
            const passwordFromKeychain =
              await apisKeychain.requestGenericPassword();
            console.log(
              '🔐 Got password from keychain:',
              !!passwordFromKeychain,
            );

            if (passwordFromKeychain) {
              // Face ID successful = wallet unlocked!
              // No need to verify password since Face ID is more secure
              console.log('✅ Face ID successful - unlocking wallet directly');

              // Mark wallet as unlocked without password verification
              apisLock.markAsUnlocked();
              await apisLock.updateUnlockTime();

              console.log('✅ Biometric unlock successful');
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
              return;
            } else {
              console.log('❌ No password from keychain');
              setErrorMessage(
                'Biometric authentication cancelled. Please enter your password.',
              );
            }
          } catch (e) {
            console.error('❌ Biometric unlock error:', e);
            setErrorMessage(
              'Biometric authentication failed. Please enter your password.',
            );
          } finally {
            setIsUnlocking(false);
            setBiometricAttempted(true); // Mark as attempted to prevent loop
          }
        }
      } catch (error) {
        console.error('❌ Fetch biometrics error:', error);
      }
    };

    attemptBiometricUnlock();
  }, [
    computed.isBiometricsEnabled,
    fetchBiometrics,
    navigation,
    biometricAttempted,
    isUnlocking,
  ]);

  const handlePasswordUnlock = useCallback(async () => {
    if (!password.trim()) {
      setErrorMessage('Password is required');
      return;
    }

    setIsUnlocking(true);
    setErrorMessage('');

    try {
      console.time('🔓 Total Unlock Time');
      console.log('🚀 Starting unlock process...');

      const result = await apisLock.unlockWallet(password);

      if (result.success) {
        console.log('✅ Unlock successful');
        // Clear password from state
        setPassword('');

        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        console.log('❌ Unlock failed:', result.error);
        setErrorMessage(
          result.formFieldError || result.error || 'Invalid password',
        );
      }
    } catch (error) {
      console.error('❌ Password unlock error:', error);
      setErrorMessage('Something went wrong');
    } finally {
      console.timeEnd('🔓 Total Unlock Time');
      setIsUnlocking(false);
    }
  }, [password, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background.primary}
      />

      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logo} />
          <Text style={styles.title}>Unlock Purro Wallet</Text>
        </View>

        {/* Authentication Area */}
        <View style={styles.authContainer}>
          <View style={styles.passwordContainer}>
            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              isPassword
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              isFocused={focusedField === 'password'}
              onSubmitEditing={handlePasswordUnlock}
              errorMessage={errorMessage || undefined}
            />

            <TouchableOpacity
              style={[
                styles.unlockButton,
                (!password.trim() || isUnlocking) &&
                  styles.unlockButtonDisabled,
              ]}
              onPress={handlePasswordUnlock}
              disabled={!password.trim() || isUnlocking}
            >
              {isUnlocking ? (
                <ActivityIndicator size="small" color={Colors.text.primary} />
              ) : (
                <Text style={styles.unlockButtonText}>Unlock</Text>
              )}
            </TouchableOpacity>
          </View>
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
  innerContainer: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background.secondary,
    marginBottom: 32,
  },
  title: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  authContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  passwordContainer: {
    gap: 16,
  },
  passwordInput: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  errorText: {
    ...Typography.styles.label,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Increased from 48 to accommodate full text
  },
  unlockButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  unlockButtonText: {
    ...Typography.styles.button,
    color: Colors.text.primary,
  },
});

export default UnlockScreen;
