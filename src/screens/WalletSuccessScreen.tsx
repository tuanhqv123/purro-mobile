import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import type { WalletSuccessScreenProps } from '@/types/navigation';

const WalletSuccessScreen: React.FC<WalletSuccessScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const handleGetStarted = () => {
    // Navigate to Home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>
            Your wallet is{'\n'}successfully created.
          </Text>
          <Text style={styles.subtitle}>Get started now.</Text>
        </View>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
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
      gap: Spacing.xl,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkCircle: {
      width: 120,
      height: 120,
      borderRadius: BorderRadius.full,
      backgroundColor: theme.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmark: {
      fontSize: 48,
      color: theme.success[400],
      fontWeight: '600',
    },
    messageContainer: {
      gap: Spacing.md,
      alignItems: 'center',
    },
    title: {
      ...Typography.h4,
      textAlign: 'center',
      color: theme.text.primary,
    },
    subtitle: {
      ...Typography.button,
      textAlign: 'center',
      color: theme.text.secondary,
    },
    button: {
      position: 'absolute',
      bottom: Spacing.xxl,
      left: Spacing.lg,
      right: Spacing.lg,
      height: 56,
      backgroundColor: theme.primary[400],
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md + 2,
    },
    buttonText: {
      ...Typography.button,
      color: theme.text.primary,
    },
  });

export default WalletSuccessScreen;
