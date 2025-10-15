import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import { useCreateWallet } from '@/hooks/wallet/useCreateWallet';
import type { WelcomeScreenProps } from '@/types/navigation';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { getSeedPhrase } = useCreateWallet();

  const handleCreateWallet = async () => {
    if (!acceptedTerms) {
      Alert.alert(
        t('welcome.termsRequired.title'),
        t('welcome.termsRequired.message'),
        [{ text: t('welcome.termsRequired.ok'), style: 'default' }],
      );
      return;
    }

    try {
      const { mnemonic } = await getSeedPhrase();

      navigation.navigate('SeedPhraseDisplay', { mnemonic });
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'), [
        { text: t('common.ok'), style: 'default' },
      ]);
    }
  };

  const handleImportWallet = () => {
    if (!acceptedTerms) {
      Alert.alert(
        t('welcome.termsRequired.title'),
        t('welcome.termsRequired.message'),
        [{ text: t('welcome.termsRequired.ok'), style: 'default' }],
      );
      return;
    }

    navigation.navigate('ImportMethods');
  };

  const toggleTermsAcceptance = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.termsSection}>
          <Pressable
            style={styles.checkboxContainer}
            onPress={toggleTermsAcceptance}
          >
            <View
              style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
            >
              {acceptedTerms && <View style={styles.checkmark} />}
            </View>
            <Text style={styles.termsText}>{t('welcome.termsText')}</Text>
          </Pressable>
        </View>

        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCreateWallet}
            disabled={!acceptedTerms}
          >
            <Text style={styles.primaryButtonText}>
              {t('welcome.createWallet')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleImportWallet}
            disabled={!acceptedTerms}
          >
            <Text style={styles.secondaryButtonText}>
              {t('welcome.importWallet')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    logoContainer: {
      marginBottom: Spacing.xl,
    },
    logoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.background.secondary,
    },
    titleSection: {
      alignItems: 'center',
      gap: Spacing.md,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      width: 335,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.body,
      color: theme.text.secondary,
      textAlign: 'center',
      width: 335,
    },
    bottomSection: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      gap: Spacing.lg,
    },
    termsSection: {
      alignItems: 'center',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    checkbox: {
      width: 16,
      height: 16,
      borderRadius: BorderRadius.xs,
      borderWidth: 1.25,
      borderColor: theme.text.secondary,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.button.primary,
      borderColor: theme.button.primary,
    },
    checkmark: {
      width: 8,
      height: 6,
      borderLeftWidth: 1.5,
      borderBottomWidth: 1.5,
      borderColor: theme.neutral.white.base,
      transform: [{ rotate: '-45deg' }],
      marginTop: -2,
      marginLeft: 1,
    },
    termsText: {
      ...Typography.label14,
      color: theme.text.secondary,
    },
    buttonsSection: {
      gap: Spacing.sm,
    },
    button: {
      width: '100%',
      minHeight: 48,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    primaryButton: {
      backgroundColor: theme.button.primary,
    },
    secondaryButton: {
      backgroundColor: theme.button.secondary,
    },
    primaryButtonText: {
      ...Typography.label16,
      fontWeight: '500',
      color: theme.button.text.primary,
    },
    secondaryButtonText: {
      ...Typography.label16,
      fontWeight: '500',
      color: theme.button.text.secondary,
    },
  });

export default WelcomeScreen;
