import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import type { WalletSuccessScreenProps } from '@/types/navigation';

/**
 * Wallet Success Screen
 * Shown after successful wallet creation
 * Following Figma design: node-id=260-1901
 */
const WalletSuccessScreen: React.FC<WalletSuccessScreenProps> = ({
  navigation,
}) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 32,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#25272C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 48,
    color: '#18C477',
    fontWeight: '600',
  },
  messageContainer: {
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Figtree',
    fontWeight: '600',
    fontSize: 32,
    lineHeight: 35.2,
    textAlign: 'center',
    color: '#F9F9F9',
  },
  subtitle: {
    fontFamily: 'Figtree',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 25.2,
    textAlign: 'center',
    color: '#6A7282',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 56,
    backgroundColor: '#059288',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  buttonText: {
    fontFamily: 'Figtree',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 25.2,
    color: '#F9F9F9',
  },
});

export default WalletSuccessScreen;
