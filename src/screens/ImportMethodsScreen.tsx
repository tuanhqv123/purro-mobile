import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import type { ImportMethodsScreenProps } from '@/types/navigation';

const ImportMethodsScreen: React.FC<ImportMethodsScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSeedPhrasePress = () => {
    navigation.navigate('ImportSeedPhrase');
  };

  const handlePrivateKeyPress = () => {
    navigation.navigate('ImportPrivateKey');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('import.methods.title')}</Text>
          <Text style={styles.subtitle}>{t('import.methods.subtitle')}</Text>
        </View>

        <View style={styles.methodsContainer}>
          {/* Recovery Phrase Card */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handleSeedPhrasePress}
            activeOpacity={0.7}
          >
            <View style={styles.methodIconContainer}>
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>📝</Text>
              </View>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>
                {t('import.methods.seedPhrase.title')}
              </Text>
              <Text style={styles.methodDescription}>
                {t('import.methods.seedPhrase.description')}
              </Text>
            </View>
            <View style={styles.methodArrow}>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Private Key Card */}
          <TouchableOpacity
            style={styles.methodCard}
            onPress={handlePrivateKeyPress}
            activeOpacity={0.7}
          >
            <View style={styles.methodIconContainer}>
              <View style={styles.methodIcon}>
                <Text style={styles.methodIconText}>🔑</Text>
              </View>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>
                {t('import.methods.privateKey.title')}
              </Text>
              <Text style={styles.methodDescription}>
                {t('import.methods.privateKey.description')}
              </Text>
            </View>
            <View style={styles.methodArrow}>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.securityNotice}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Your keys are encrypted and stored only on your device
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.xxl,
    },
    header: {
      marginBottom: Spacing.xxxl,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      marginBottom: Spacing.sm,
      textAlign: 'left',
    },
    subtitle: {
      ...Typography.body,
      color: theme.text.secondary,
    },
    methodsContainer: {
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    methodCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: theme.border.default,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    methodIconContainer: {
      marginRight: Spacing.md,
    },
    methodIcon: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.primary[500] + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    methodIconText: {
      fontSize: 28,
    },
    methodContent: {
      flex: 1,
    },
    methodTitle: {
      ...Typography.button,
      color: theme.text.primary,
      marginBottom: Spacing.xs,
    },
    methodDescription: {
      ...Typography.label14,
      color: theme.text.secondary,
    },
    methodArrow: {
      marginLeft: Spacing.sm,
    },
    arrowIcon: {
      fontSize: 28,
      color: theme.text.tertiary,
      fontWeight: '300',
    },
    footer: {
      marginTop: 'auto',
      paddingTop: Spacing.xl,
    },
    securityNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: theme.border.light,
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
  });

export default ImportMethodsScreen;
