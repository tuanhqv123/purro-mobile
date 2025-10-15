import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { usePreventScreenshot } from '@/hooks/native/security';
import type { SeedPhraseDisplayScreenProps } from '@/types/navigation';
const ProgressIndicator = ({ styles }: { styles: any }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={styles.progressStep} />
      <View style={styles.progressStep} />
      <View style={styles.progressStep} />
    </View>
  </View>
);

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

const SeedPhraseDisplayScreen: React.FC<SeedPhraseDisplayScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { mnemonic } = route.params;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [words] = useState(() => mnemonic.split(' '));

  // Screenshot prevention (Rabby pattern)
  usePreventScreenshot(true);

  const handleContinue = () => {
    if (!isConfirmed) {
      return;
    }

    navigation.navigate('SeedPhraseVerify', { mnemonic });
  };

  const toggleConfirmation = () => {
    setIsConfirmed(!isConfirmed);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.background.primary}
      />

      <View style={styles.content}>
        <ProgressIndicator styles={styles} />

        <Text style={styles.title}>Your Seed Phrase</Text>

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
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          style={styles.checkboxContainer}
          onPress={toggleConfirmation}
        >
          <View
            style={[styles.checkbox, isConfirmed && styles.checkboxChecked]}
          >
            {isConfirmed && <View style={styles.checkmark} />}
          </View>
          <Text style={styles.checkboxText}>I've saved my seed phrase</Text>
        </Pressable>

        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Store your seed phrase in a safe & offline place, never share it
            with anyone. This is the only way to recover your wallet.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !isConfirmed && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isConfirmed}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isConfirmed && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </TouchableOpacity>
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
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
    },
    progressContainer: {
      width: 240,
      marginBottom: 56,
    },
    progressBar: {
      flexDirection: 'row',
      gap: 4,
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.full,
      height: 3,
    },
    progressStep: {
      flex: 1,
      height: 3,
      backgroundColor: theme.neutral.gray[500],
      borderRadius: BorderRadius.full,
    },
    progressActive: {
      backgroundColor: theme.primary[400],
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      textAlign: 'center',
      width: 335,
      marginBottom: 56,
    },
    wordsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm + 2,
      width: 362,
      justifyContent: 'center',
    },
    wordCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(37, 39, 44, 0.6)',
      borderRadius: Spacing.sm + 2,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md - 4,
      width: 176,
      minHeight: 48,
      gap: Spacing.md - 2,
    },
    wordIndex: {
      ...Typography.label16,
      color: theme.text.secondary,
      width: 24,
      textAlign: 'left',
    },
    wordText: {
      ...Typography.label16,
      color: theme.text.primary,
      flex: 1,
    },
    bottomSection: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      gap: Spacing.xl,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
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
      backgroundColor: theme.primary[400],
      borderColor: theme.primary[400],
    },
    checkmark: {
      position: 'absolute',
      width: 3,
      height: 7,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderColor: theme.neutral.white.base,
      transform: [{ rotate: '45deg' }],
      top: 2,
      left: 5,
    },
    checkboxText: {
      ...Typography.label14,
      color: theme.text.primary,
    },
    warningContainer: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
    },
    warningText: {
      ...Typography.label14,
      color: theme.text.primary,
      flex: 1,
    },
    continueButton: {
      backgroundColor: theme.primary[400],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    continueButtonDisabled: {
      backgroundColor: theme.background.secondary,
    },
    continueButtonText: {
      ...Typography.button,
      color: theme.text.primary,
    },
    continueButtonTextDisabled: {
      color: theme.text.secondary,
    },
  });

export default SeedPhraseDisplayScreen;
