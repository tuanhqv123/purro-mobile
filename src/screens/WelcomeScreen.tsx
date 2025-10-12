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
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useTranslation } from '@/utils/i18n';
import { useCreateWallet } from '@/hooks/wallet/useCreateWallet';
import type { WelcomeScreenProps } from '@/types/navigation';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
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

    Alert.alert(
      t('welcome.importWallet'),
      'Import wallet feature coming soon',
      [{ text: t('common.ok'), style: 'default' }],
    );
  };

  const toggleTermsAcceptance = () => {
    setAcceptedTerms(!acceptedTerms);
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    height: 56,
  },
  statusBarTime: {
    ...Typography.styles.system,
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
  },
  titleSection: {
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
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  termsSection: {
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.25,
    borderColor: Colors.text.secondary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  checkmark: {
    width: 8,
    height: 6,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.system.white,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
    marginLeft: 1,
  },
  termsText: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
  },
  buttonsSection: {
    gap: 8,
  },
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.background.secondary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.button.secondary.text,
    lineHeight: 20,
  },
});

export default WelcomeScreen;
