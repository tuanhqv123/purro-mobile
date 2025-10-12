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
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { usePreventScreenshot } from '@/hooks/native/security';
import type { SeedPhraseDisplayScreenProps } from '@/types/navigation';
const ProgressIndicator = () => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progressStep, styles.progressActive]} />
      <View style={styles.progressStep} />
      <View style={styles.progressStep} />
      <View style={styles.progressStep} />
    </View>
  </View>
);

const SeedWordCard = ({ word, index }: { word: string; index: number }) => (
  <View style={styles.wordCard}>
    <Text style={styles.wordIndex}>{index}</Text>
    <Text style={styles.wordText}>{word}</Text>
  </View>
);

const SeedPhraseDisplayScreen: React.FC<SeedPhraseDisplayScreenProps> = ({
  route,
  navigation,
}) => {
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
        backgroundColor={Colors.background.primary}
      />

      <View style={styles.content}>
        <ProgressIndicator />

        <Text style={styles.title}>Your Seed Phrase</Text>

        <View style={styles.wordsGrid}>
          {words.map((word, index) => (
            <SeedWordCard key={index} word={word} index={index + 1} />
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
  title: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
    textAlign: 'center',
    width: 335,
    marginBottom: 56,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: 362,
    justifyContent: 'center',
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 39, 44, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 176,
    minHeight: 48,
    gap: 14,
  },
  wordIndex: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
    width: 24,
    textAlign: 'left',
  },
  wordText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
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
    position: 'absolute',
    width: 3,
    height: 7,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.system.white,
    transform: [{ rotate: '45deg' }],
    top: 2,
    left: 5,
  },
  checkboxText: {
    ...Typography.styles.label,
    color: Colors.text.primary,
  },
  warningContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  warningText: {
    ...Typography.styles.label,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 19.6,
  },
  continueButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.button.primary.disabled.background,
  },
  continueButtonText: {
    ...Typography.styles.button,
    color: Colors.text.primary,
  },
  continueButtonTextDisabled: {
    color: Colors.button.primary.disabled.text,
  },
});

export default SeedPhraseDisplayScreen;
