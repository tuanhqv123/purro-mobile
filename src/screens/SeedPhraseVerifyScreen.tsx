import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { useProtectedScreen } from '@/hooks/security';
import type { SeedPhraseVerifyScreenProps } from '@/types/navigation';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';
import range from 'lodash/range';
import { PasswordInput } from '@/components/Input';

const ProgressIndicator = ({ styles }: { styles: any }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={styles.progressStep} />
      <View style={styles.progressStep} />
    </View>
  </View>
);

const WordInput = ({
  position,
  label,
  wordInputs,
  focusedInput,
  onWordChange,
  onFocus,
  onBlur,
  styles,
  theme,
}: {
  position: number;
  label: string;
  wordInputs: { [key: number]: string };
  focusedInput: number | null;
  onWordChange: (position: number, value: string) => void;
  onFocus: (position: number) => void;
  onBlur: () => void;
  styles: any;
  theme: any;
}) => {
  const isFocused = focusedInput === position;
  const value = wordInputs[position] ?? '';
  const hasValue = value.length > 0;

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <PasswordInput
        containerStyle={[
          styles.inputField,
          isFocused && styles.inputFieldFocused,
          hasValue && styles.inputFieldFilled,
        ]}
        inputStyle={styles.textInput}
        inputProps={{
          placeholder: 'Enter something',
          placeholderTextColor: theme.text.secondary,
          value,
          onChangeText: text => onWordChange(position, text),
          onFocus: () => onFocus(position),
          onBlur,
          returnKeyType: 'next',
        }}
      />
    </View>
  );
};

const SeedPhraseVerifyScreen: React.FC<SeedPhraseVerifyScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { mnemonic } = route.params;

  const words = useMemo(() => mnemonic.split(' '), [mnemonic]);
  const createVerificationPlan = useCallback(() => {
    if (words.length === 0) {
      return {
        positions: [],
        inputs: {} as Record<number, string>,
      };
    }

    const positions = sortBy(
      shuffle(range(0, words.length)).slice(0, Math.min(3, words.length)),
    );

    const inputs = positions.reduce<Record<number, string>>((acc, position) => {
      acc[position] = '';
      return acc;
    }, {});

    return { positions, inputs };
  }, [words.length]);

  const [{ positions: verifyPositions, inputs: wordInputs }, setVerification] =
    useState(() => createVerificationPlan());

  const [focusedInput, setFocusedInput] = useState<number | null>(null);

  // Enable screenshot prevention for this screen
  useProtectedScreen('SeedPhrase');

  const handleWordChange = (position: number, value: string) => {
    setVerification(prev => ({
      positions: prev.positions,
      inputs: {
        ...prev.inputs,
        [position]: value.toLowerCase().trim(),
      },
    }));
  };

  const validateInputs = (): boolean => {
    for (const position of verifyPositions) {
      const inputWord = wordInputs[position];
      const correctWord = words[position];

      if (inputWord !== correctWord) {
        return false;
      }
    }
    return true;
  };

  const canContinue =
    verifyPositions.length > 0 &&
    verifyPositions.every(position => wordInputs[position]?.length > 0);

  const regenerateVerification = useCallback(() => {
    setVerification(createVerificationPlan());
    setFocusedInput(null);
  }, [createVerificationPlan]);

  const handleContinue = () => {
    if (!validateInputs()) {
      regenerateVerification();
      return;
    }

    navigation.navigate('CreatePassword', { mnemonic });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Indicator */}
        <ProgressIndicator styles={styles} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify seed phrase</Text>
          <Text style={styles.subtitle}>Your Gateway to Hyperliquid</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          {verifyPositions.map(position => (
            <WordInput
              key={position}
              position={position}
              label={`Word #${position + 1}`}
              wordInputs={wordInputs}
              focusedInput={focusedInput}
              onWordChange={handleWordChange}
              onFocus={setFocusedInput}
              onBlur={() => setFocusedInput(null)}
              styles={styles}
              theme={theme}
            />
          ))}
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              !canContinue && styles.continueButtonTextDisabled,
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
      justifyContent: 'space-between',
      paddingBottom: Spacing.xxl,
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
    header: {
      alignItems: 'center',
      gap: Spacing.md,
    },
    title: {
      ...Typography.h4,
      color: theme.text.primary,
      textAlign: 'center',
      width: 335,
    },
    subtitle: {
      ...Typography.button,
      color: theme.text.secondary,
      textAlign: 'center',
      width: 335,
    },
    inputsContainer: {
      width: '100%',
      gap: Spacing.lg,
    },
    inputContainer: {
      gap: Spacing.md - 4,
    },
    inputLabelContainer: {
      paddingHorizontal: Spacing.sm,
    },
    inputLabel: {
      ...Typography.label14,
      color: theme.text.primary,
    },
    inputField: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      height: 48,
      gap: Spacing.md - 2,
      borderWidth: 1,
      borderColor: theme.background.secondary,
    },
    inputFieldFocused: {
      borderColor: theme.primary[400],
    },
    inputFieldFilled: {
      // Filled state styling
    },
    textInput: {
      color: theme.text.primary,
      flex: 1,
      padding: 0,
      margin: 0,
      ...Typography.label16,
      height: 20,
      textAlignVertical: 'center',
    },
    inputCheckIcon: {
      width: 24,
      height: 24,
      backgroundColor: theme.neutral.white.base,
      borderRadius: BorderRadius.md,
    },
    bottomSection: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    continueButton: {
      backgroundColor: theme.primary[400],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      width: '100%',
    },
    continueButtonDisabled: {
      backgroundColor: theme.background.secondary,
    },
    continueButtonText: {
      ...Typography.label16,
      fontWeight: '500',
      color: theme.text.primary,
    },
    continueButtonTextDisabled: {
      color: theme.text.secondary,
    },
  });

export default SeedPhraseVerifyScreen;
