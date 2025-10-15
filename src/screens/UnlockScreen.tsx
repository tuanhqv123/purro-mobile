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
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { FormInput } from '@/components/FormInput';
import { apisLock, apisKeychain } from '@/core/apis';
import { useBiometrics } from '@/hooks/biometrics';
import type { UnlockScreenProps } from '@/types/navigation';

const UnlockScreen: React.FC<UnlockScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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

        if (
          computed.isBiometricsEnabled &&
          !isUnlocking &&
          !biometricAttempted
        ) {
          setIsUnlocking(true);
          setErrorMessage('');

          try {
            const passwordFromKeychain =
              await apisKeychain.requestGenericPassword();

            if (passwordFromKeychain) {
              const result = await apisLock.unlockWallet(passwordFromKeychain);

              if (result.success) {
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                return;
              } else {
                setErrorMessage(
                  'Failed to unlock wallet. Please enter your password.',
                );
              }
            } else {
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
      const result = await apisLock.unlockWallet(password);

      if (result.success) {
        // Clear password from state
        setPassword('');

        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setErrorMessage(
          result.formFieldError || result.error || 'Invalid password',
        );
      }
    } catch (error) {
      console.error('❌ Password unlock error:', error);
      setErrorMessage('Something went wrong');
    } finally {
      setIsUnlocking(false);
    }
  }, [password, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.background.primary}
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
                <ActivityIndicator size="small" color={theme.text.primary} />
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

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    innerContainer: {
      flex: 1,
    },
    logoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.background.secondary,
      marginBottom: Spacing.xl,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      textAlign: 'center',
    },
    authContainer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    passwordContainer: {
      gap: Spacing.md,
    },
    passwordInput: {
      ...Typography.body,
      color: theme.text.primary,
      backgroundColor: theme.background.secondary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md - 2,
      minHeight: 48,
    },
    errorText: {
      ...Typography.label14,
      color: theme.danger[400],
      textAlign: 'center',
    },
    unlockButton: {
      backgroundColor: theme.primary[400],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 56,
    },
    unlockButtonDisabled: {
      backgroundColor: theme.background.secondary,
    },
    unlockButtonText: {
      ...Typography.button,
      color: theme.text.primary,
    },
  });

export default UnlockScreen;
