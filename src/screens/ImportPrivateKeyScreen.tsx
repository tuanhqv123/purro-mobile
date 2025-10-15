import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import type { ImportPrivateKeyScreenProps } from '@/types/navigation';

const ImportPrivateKeyScreen: React.FC<ImportPrivateKeyScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const handlePaste = useCallback(async () => {
    try {
      const { default: Clipboard } = await import(
        '@react-native-clipboard/clipboard'
      );
      const text = await Clipboard.getString();
      if (text) {
        setPrivateKey(text.trim());
        setError('');
      }
    } catch (err) {
      setError('Failed to paste from clipboard');
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    const cleanKey = privateKey.trim();

    if (cleanKey.length === 0) {
      setError(t('import.privateKey.validation.empty'));
      return;
    }

    const keyWithoutPrefix = cleanKey.startsWith('0x')
      ? cleanKey.slice(2)
      : cleanKey;

    if (keyWithoutPrefix.length !== 64) {
      setError(t('import.privateKey.validation.invalidLength'));
      return;
    }

    if (!/^[0-9a-fA-F]+$/.test(keyWithoutPrefix)) {
      setError(t('import.privateKey.validation.invalidFormat'));
      return;
    }

    setImporting(true);
    setError('');

    try {
      const keyWithPrefix = cleanKey.startsWith('0x')
        ? cleanKey
        : `0x${cleanKey}`;

      navigation.navigate('CreatePassword', {
        mnemonic: keyWithPrefix,
        isImport: true,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import private key',
      );
    } finally {
      setImporting(false);
    }
  }, [privateKey, navigation, t]);

  const handleChangeText = useCallback((text: string) => {
    setPrivateKey(text);
    setError('');
  }, []);

  const isValid = privateKey.trim().length > 0 && !importing;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔑</Text>
              </View>
              <Text style={styles.title}>{t('import.privateKey.title')}</Text>
              <Text style={styles.subtitle}>
                {t('import.privateKey.subtitle')}
              </Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <TouchableOpacity
                  style={styles.pasteButton}
                  onPress={handlePaste}
                  activeOpacity={0.7}
                  disabled={importing}
                >
                  <Text style={styles.pasteButtonText}>
                    {t('import.privateKey.pasteButton')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  value={privateKey}
                  onChangeText={handleChangeText}
                  placeholder={t('import.privateKey.placeholder')}
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  numberOfLines={4}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textAlignVertical="top"
                  secureTextEntry
                  editable={!importing}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                  {t('import.privateKey.info.title')}
                </Text>
                <Text style={styles.infoText}>
                  {t('import.privateKey.info.description')}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.securityNotice}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  {t('import.privateKey.security')}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !isValid && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!isValid}
                activeOpacity={0.7}
              >
                {importing ? (
                  <ActivityIndicator color={theme.text.inverse} />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {t('import.privateKey.confirmButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    header: {
      alignItems: 'center',
      paddingTop: Spacing.xxl,
      paddingBottom: Spacing.xl,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    icon: {
      fontSize: 32,
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
      paddingHorizontal: Spacing.lg,
    },
    inputSection: {
      marginBottom: Spacing.lg,
    },
    inputHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: Spacing.sm + 2,
    },
    pasteButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.background.secondary,
      borderRadius: BorderRadius.sm + 2,
    },
    pasteButtonText: {
      ...Typography.label14,
      color: theme.primary[400],
      fontWeight: '600',
    },
    inputContainer: {
      backgroundColor: theme.background.secondary,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.border.default,
    },
    textArea: {
      ...Typography.body,
      color: theme.text.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    errorContainer: {
      marginTop: Spacing.sm + 2,
      paddingHorizontal: Spacing.sm,
    },
    errorText: {
      ...Typography.label14,
      color: theme.danger[400],
    },
    infoSection: {
      marginBottom: Spacing.lg,
    },
    infoCard: {
      backgroundColor: theme.background.secondary,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    infoTitle: {
      ...Typography.label16,
      color: theme.text.primary,
      fontWeight: '600',
    },
    infoText: {
      ...Typography.label14,
      color: theme.text.secondary,
      lineHeight: 20,
    },
    footer: {
      marginTop: 'auto',
      gap: Spacing.lg,
    },
    securityNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
      backgroundColor: theme.background.secondary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    securityIcon: {
      fontSize: 20,
    },
    securityText: {
      ...Typography.label14,
      color: theme.text.secondary,
      flex: 1,
    },
    confirmButton: {
      backgroundColor: theme.primary[400],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    confirmButtonDisabled: {
      backgroundColor: theme.neutral.gray[600],
    },
    confirmButtonText: {
      ...Typography.button,
      color: theme.text.inverse,
    },
  });

export default ImportPrivateKeyScreen;
