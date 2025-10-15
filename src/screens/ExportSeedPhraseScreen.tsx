import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { usePreventScreenshot } from '@/hooks/native/security';
import { RcNextLeftCC } from '@/assets/icons/common';
import type { ExportSeedPhraseScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const SeedWordCard = ({
  word,
  index,
  styles,
}: {
  word: string;
  index: number;
  styles: any;
}) => (
  <View style={styles.wordCard}>
    <Text style={styles.wordIndex}>{index}</Text>
    <Text style={styles.wordText}>{word}</Text>
  </View>
);

const ExportSeedPhraseScreen: React.FC<ExportSeedPhraseScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { mnemonic } = route.params;

  const [words] = useState(() => mnemonic.split(' '));

  // Screenshot prevention
  usePreventScreenshot(true);

  const handleCopyToClipboard = () => {
    Clipboard.setString(mnemonic);
    Alert.alert('Success', t('export.seedPhrase.copied'));
  };

  const handleDone = () => {
    navigation.goBack();
    // Go back twice to return to Settings
    setTimeout(() => navigation.goBack(), 100);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <RcNextLeftCC width={24} height={24} color={theme.primary[400]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('export.seedPhrase.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>{t('export.seedPhrase.subtitle')}</Text>

        {/* Words Grid */}
        <View style={styles.wordsGrid}>
          {words.map((word, index) => (
            <SeedWordCard
              key={index}
              word={word}
              index={index + 1}
              styles={styles}
            />
          ))}
        </View>

        {/* Copy Button */}
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyToClipboard}
        >
          <Text style={styles.copyIcon}>📋</Text>
          <Text style={styles.copyButtonText}>
            {t('export.seedPhrase.copyButton')}
          </Text>
        </TouchableOpacity>

        {/* Security Warning */}
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            {t('export.seedPhrase.warning')}
          </Text>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {t('export.seedPhrase.security.title')}
          </Text>
          {(
            t('export.seedPhrase.security.items', {
              returnObjects: true,
            }) as string[]
          ).map((item: string, index: number) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>
            {t('export.seedPhrase.button')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.light,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...Typography.h4,
      color: theme.text.primary,
      fontSize: 18,
    },
    headerRight: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    subtitle: {
      ...Typography.body,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    wordsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    wordCard: {
      width: '31%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background.card,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.border.default,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
    },
    wordIndex: {
      ...Typography.label14,
      color: theme.text.tertiary,
      minWidth: 20,
    },
    wordText: {
      ...Typography.body,
      color: theme.text.primary,
      fontSize: 14,
      flex: 1,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    copyIcon: {
      fontSize: 20,
    },
    copyButtonText: {
      ...Typography.button,
      color: theme.button.text.primary,
      fontSize: 16,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: Spacing.md,
      backgroundColor: theme.danger[50],
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.danger[400],
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    warningIcon: {
      fontSize: 20,
    },
    warningText: {
      ...Typography.label14,
      color: theme.text.primary,
      flex: 1,
    },
    tipsContainer: {
      backgroundColor: theme.background.card,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: theme.border.default,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    tipsTitle: {
      ...Typography.button,
      color: theme.text.primary,
      marginBottom: Spacing.sm,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: Spacing.sm,
      gap: Spacing.sm,
    },
    tipBullet: {
      ...Typography.body,
      color: theme.text.secondary,
      fontSize: 18,
      lineHeight: 20,
    },
    tipText: {
      ...Typography.label14,
      color: theme.text.secondary,
      flex: 1,
    },
    buttonContainer: {
      padding: Spacing.lg,
      backgroundColor: theme.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.border.light,
    },
    doneButton: {
      backgroundColor: theme.button.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    doneButtonText: {
      ...Typography.button,
      color: theme.button.text.primary,
      fontSize: 16,
    },
  });

export default ExportSeedPhraseScreen;
