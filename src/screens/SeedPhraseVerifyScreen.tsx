import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useProtectedScreen } from '@/hooks/security';
import type { SeedPhraseVerifyScreenProps } from '@/types/navigation';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';
import range from 'lodash/range';
import { PasswordInput } from '@/components/Input';

const ProgressIndicator = () => (
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
}: {
  position: number;
  label: string;
  wordInputs: { [key: number]: string };
  focusedInput: number | null;
  onWordChange: (position: number, value: string) => void;
  onFocus: (position: number) => void;
  onBlur: () => void;
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
          placeholderTextColor: Colors.text.secondary,
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
        <ProgressIndicator />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  progressContainer: {
    width: 240,
    marginBottom: 56,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 3,
  },
  progressStep: {
    flex: 1,
    height: 3,
    backgroundColor: '#494F5B',
    borderRadius: 999,
  },
  progressActive: {
    backgroundColor: Colors.brand.primary,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
    textAlign: 'center',
    width: 335,
  },
  subtitle: {
    ...Typography.styles.button,
    color: Colors.text.secondary,
    textAlign: 'center',
    width: 335,
  },
  inputsContainer: {
    width: '100%',
    gap: 24,
  },
  inputContainer: {
    gap: 12,
  },
  inputLabelContainer: {
    paddingHorizontal: 8,
  },
  inputLabel: {
    ...Typography.styles.label,
    color: Colors.text.primary,
  },
  inputField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 48,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
  },
  inputFieldFocused: {
    borderColor: Colors.brand.primary,
  },
  inputFieldFilled: {
    // Filled state styling
  },
  textInput: {
    color: Colors.text.primary,
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    height: 20,
    textAlignVertical: 'center',
  },
  inputCheckIcon: {
    width: 24,
    height: 24,
    backgroundColor: Colors.system.white,
    borderRadius: 12,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.button.primary.disabled.background,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  continueButtonTextDisabled: {
    color: Colors.button.primary.disabled.text,
  },
});

export default SeedPhraseVerifyScreen;
