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
import type { ImportSeedPhraseScreenProps } from '@/types/navigation';
import { mnemonicToEntropy } from '@scure/bip39';

const ImportSeedPhraseScreen: React.FC<ImportSeedPhraseScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const handlePaste = useCallback(async () => {
    try {
      const { default: Clipboard } = await import(
        '@react-native-clipboard/clipboard'
      );
      const text = await Clipboard.getString();
      if (text) {
        setSeedPhrase(text.trim());
        setError('');
      }
    } catch (err) {
      setError('Failed to paste from clipboard');
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    const words = seedPhrase.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      setError(t('import.seedPhrase.validation.empty'));
      return;
    }

    if (words.length !== 12 && words.length !== 24) {
      setError(t('import.seedPhrase.validation.invalidWordCount'));
      return;
    }

    try {
      const englishWordlist =
        require('@scure/bip39/wordlists/english').wordlist;
      mnemonicToEntropy(words.join(' '), englishWordlist);
    } catch (err) {
      const englishWordlist =
        require('@scure/bip39/wordlists/english').wordlist;
      const invalidWords: string[] = [];
      words.forEach(word => {
        if (!englishWordlist.includes(word)) {
          invalidWords.push(word);
        }
      });

      if (invalidWords.length > 0) {
        setError(
          t(
            invalidWords.length > 1
              ? 'import.seedPhrase.validation.invalidWords'
              : 'import.seedPhrase.validation.invalidWord',
            { words: invalidWords.join(', ') },
          ),
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Invalid mnemonic phrase',
        );
      }
      return;
    }

    setImporting(true);
    setError('');

    try {
      navigation.navigate('CreatePassword', {
        mnemonic: words.join(' '),
        isImport: true,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to import seed phrase',
      );
    } finally {
      setImporting(false);
    }
  }, [seedPhrase, navigation, t]);

  const handleChangeText = useCallback((text: string) => {
    setSeedPhrase(text);
    setError('');
  }, []);

  const wordCount = seedPhrase.trim().split(/\s+/).filter(Boolean).length;
  const isValid = wordCount > 0 && !importing;

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
                <Text style={styles.icon}>📝</Text>
              </View>
              <Text style={styles.title}>{t('import.seedPhrase.title')}</Text>
              <Text style={styles.subtitle}>
                {t('import.seedPhrase.subtitle')}
              </Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <TouchableOpacity
                  style={styles.pasteButton}
                  onPress={handlePaste}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pasteButtonText}>
                    {t('import.seedPhrase.pasteButton')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.wordCounter}>
                  <Text style={styles.wordCountText}>
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  value={seedPhrase}
                  onChangeText={handleChangeText}
                  placeholder={t('import.seedPhrase.placeholder')}
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  numberOfLines={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textAlignVertical="top"
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
                  {t('import.seedPhrase.helpButton')}
                </Text>
                <Text style={styles.infoText}>
                  {t('import.seedPhrase.helpText')}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.securityNotice}>
                <Text style={styles.securityIcon}>�</Text>
                <Text style={styles.securityText}>
                  {t('import.seedPhrase.validation.duplicate')}
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
                    {t('common.confirm')}
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
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius.xl,
      backgroundColor: theme.primary[500] + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    icon: {
      fontSize: 40,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.body,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    inputSection: {
      marginBottom: Spacing.lg,
    },
    inputHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    pasteButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.button.primary,
      borderRadius: BorderRadius.md,
    },
    pasteButtonText: {
      ...Typography.button,
      color: theme.button.text.primary,
      fontSize: 14,
    },
    wordCounter: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: theme.background.card,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.border.default,
    },
    wordCountText: {
      ...Typography.label14,
      color: theme.text.secondary,
    },
    inputContainer: {
      backgroundColor: theme.input.background,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: theme.input.border,
      padding: Spacing.md,
      minHeight: 180,
    },
    textArea: {
      ...Typography.body,
      color: theme.text.primary,
      minHeight: 160,
      textAlignVertical: 'top',
    },
    errorContainer: {
      marginTop: Spacing.md,
      padding: Spacing.md,
      backgroundColor: theme.danger[50],
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.danger[400],
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

export default ImportSeedPhraseScreen;
