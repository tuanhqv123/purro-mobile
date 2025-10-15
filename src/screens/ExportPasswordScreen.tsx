import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { FormInput } from '@/components/FormInput';
import { RcNextLeftCC } from '@/assets/icons/common';
import { apisLock } from '@/core/apis';
import type { ExportPasswordScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const ExportPasswordScreen: React.FC<ExportPasswordScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<'password' | null>(null);

  const handleVerifyPassword = useCallback(async () => {
    if (!password.trim()) {
      setErrorMessage(t('export.password.error'));
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const result = await apisLock.unlockWallet(password);

      if (result.success) {
        const { keyringService } = await import('@/core/services/keyring');

        if (!keyringService.isUnlocked()) {
          setErrorMessage(t('export.password.error'));
          setIsVerifying(false);
          return;
        }

        try {
          if (!keyringService.hasHDKeyring()) {
            console.log('❌ No HD keyring found');
            setErrorMessage(t('export.password.noMnemonic'));
            setIsVerifying(false);
            return;
          }

          console.log('✅ HD keyring found, exporting mnemonic...');
          const mnemonic = keyringService.exportMnemonic(0);

          if (!mnemonic) {
            console.log('❌ Mnemonic is empty');
            setErrorMessage(t('export.password.noMnemonic'));
            setIsVerifying(false);
            return;
          }

          console.log('✅ Mnemonic exported successfully');
          setPassword('');
          navigation.navigate('ExportSeedPhrase', { mnemonic });
        } catch (exportError: any) {
          console.log('❌ Export error:', exportError);
          setErrorMessage(
            exportError?.message || t('export.password.noMnemonic'),
          );
          setIsVerifying(false);
          return;
        }
      } else {
        setErrorMessage(
          result.formFieldError || result.error || t('export.password.error'),
        );
      }
    } catch (error: any) {
      setErrorMessage(error?.message || t('export.password.error'));
    } finally {
      setIsVerifying(false);
    }
  }, [password, navigation, t]);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.background.primary}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <RcNextLeftCC width={24} height={24} color={theme.primary[400]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔐</Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>{t('export.password.title')}</Text>
            <Text style={styles.subtitle}>{t('export.password.subtitle')}</Text>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <FormInput
                label=""
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={t('export.password.placeholder')}
                isPassword
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'password'}
                onSubmitEditing={handleVerifyPassword}
                errorMessage={errorMessage}
              />
            </View>

            {/* Security Warning */}
            <View style={styles.securityNotice}>
              <Text style={styles.securityIcon}>⚠️</Text>
              <Text style={styles.securityText}>
                {t('export.password.security')}
              </Text>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!password.trim() || isVerifying) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={handleVerifyPassword}
              disabled={!password.trim() || isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color={theme.text.primary} />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {t('export.password.button')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
    },
    header: {
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingBottom: Spacing.xxxl,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.xl,
      backgroundColor: theme.primary[500] + '15',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: Spacing.lg,
    },
    icon: {
      fontSize: 40,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.body,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: Spacing.xxxl,
      paddingHorizontal: Spacing.md,
    },
    inputContainer: {
      marginBottom: Spacing.lg,
    },
    securityNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      backgroundColor: theme.warning[50],
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.warning[400],
    },
    securityIcon: {
      fontSize: 20,
      marginRight: Spacing.sm,
    },
    securityText: {
      ...Typography.label14,
      color: theme.text.secondary,
      flex: 1,
    },
    buttonContainer: {
      paddingVertical: Spacing.lg,
    },
    confirmButton: {
      backgroundColor: theme.button.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    confirmButtonDisabled: {
      backgroundColor: theme.button.primaryDisabled,
      opacity: 0.5,
    },
    confirmButtonText: {
      ...Typography.button,
      color: theme.button.text.primary,
      fontSize: 16,
    },
  });

export default ExportPasswordScreen;
