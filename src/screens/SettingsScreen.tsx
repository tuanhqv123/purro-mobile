import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import { RcNextLeftCC, RcArrowRightCC } from '@/assets/icons/common';
import { useTranslation } from '@/utils/i18n';
import { useBiometrics } from '@/hooks/biometrics';
import { apisLock, apisWallet, apisKeychain } from '@/core/apis';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import type { SettingsScreenProps } from '@/types/navigation';

// Setting Item Component
interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  styles: any;
  theme: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
  styles,
  theme,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingItemLeft}>
      <Text style={styles.settingItemTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
    </View>
    {rightComponent ||
      (showArrow && (
        <RcArrowRightCC width={20} height={20} color={theme.primary[400]} />
      ))}
  </TouchableOpacity>
);

// Section Header Component
interface SectionHeaderProps {
  title: string;
  styles: any;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, styles }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  useTranslation();

  const {
    computed: { isBiometricsEnabled, defaultTypeLabel, couldSetupBiometrics },
    toggleBiometrics,
    fetchBiometrics,
  } = useBiometrics({ autoFetch: true });

  const [isEnablingBiometrics, setIsEnablingBiometrics] = useState(false);

  useEffect(() => {
    fetchBiometrics();
  }, [fetchBiometrics]);

  const handleBiometricToggle = async (value: boolean) => {
    if (isEnablingBiometrics) return;

    setIsEnablingBiometrics(true);

    try {
      if (value) {
        // Enable biometrics - get real wallet password and save with Face ID
        try {
          console.log('🔐 Setting up Face ID authentication...');

          console.log('🔐 Getting password via Face ID scan...');

          // Try to get password from keychain first (if Face ID already enabled)
          let walletPassword = null;
          try {
            walletPassword = await apisKeychain.requestGenericPassword();
            console.log('🔐 Got password from keychain:', !!walletPassword);
          } catch (error) {
            console.log(
              '🔐 No existing keychain password, will prompt for Face ID',
            );
          }

          // If no password from keychain, get from keyring (password unlock)
          if (!walletPassword) {
            const { keyringService } = await import('@/core/services/keyring');
            if (!keyringService.isUnlocked()) {
              Alert.alert(
                'Error',
                'Please unlock wallet first to enable Face ID',
              );
              setIsEnablingBiometrics(false);
              return;
            }
            walletPassword = keyringService.getPassword();
          }

          if (!walletPassword) {
            Alert.alert('Error', 'Unable to get wallet password');
            setIsEnablingBiometrics(false);
            return;
          }

          console.log('🔐 Saving wallet password with Face ID protection...');

          // Clear existing keychain first, then save with Face ID protection
          try {
            await apisKeychain.resetGenericPassword();
            console.log('🔐 Cleared existing keychain data');
          } catch (error) {
            console.log('🔐 No existing keychain data to clear');
          }

          // Now save password with Face ID protection - this will trigger Face ID prompt
          await apisKeychain.setGenericPassword(
            walletPassword,
            KEYCHAIN_AUTH_TYPES.BIOMETRICS,
          );

          // Refresh biometrics state to reflect the change
          await fetchBiometrics();

          // If we reach here, Face ID was successful
          console.log('✅ Face ID successful - real password saved');
          console.log('✅ Biometrics enabled successfully');
          Alert.alert(
            'Success',
            `${defaultTypeLabel} authentication enabled successfully!`,
          );
        } catch (error) {
          console.error('❌ Error enabling biometrics:', error);
          Alert.alert(
            'Error',
            'Failed to enable biometric authentication. Please try again.',
          );
        } finally {
          setIsEnablingBiometrics(false);
        }
      } else {
        // Disable biometrics
        Alert.alert(
          'Disable Biometric Authentication?',
          `Are you sure you want to disable ${defaultTypeLabel}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsEnablingBiometrics(false),
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  await toggleBiometrics(false, {});
                  await fetchBiometrics();
                  setIsEnablingBiometrics(false);

                  Alert.alert(
                    'Disabled',
                    `${defaultTypeLabel} has been disabled`,
                  );
                } catch (err) {
                  console.error('Error disabling biometrics:', err);
                  Alert.alert(
                    'Error',
                    'Failed to disable biometric authentication',
                  );
                  setIsEnablingBiometrics(false);
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
      setIsEnablingBiometrics(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon', [
      { text: 'OK', style: 'default' },
    ]);
  };

  const handleShowRecoveryPhrase = () => {
    navigation.navigate('ExportPassword');
  };

  const handleResetWallet = () => {
    Alert.alert(
      'Reset Wallet',
      'Are you sure you want to reset your wallet? This action cannot be undone. Make sure you have backed up your seed phrase.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              apisWallet.resetWallet();
              await apisLock.lockWallet();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error resetting wallet:', error);
              Alert.alert('Error', 'Failed to reset wallet');
            }
          },
        },
      ],
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <SectionHeader title="Security" styles={styles} />
        <View style={styles.section}>
          {couldSetupBiometrics && (
            <SettingItem
              title={`${defaultTypeLabel} Authentication`}
              subtitle={
                isBiometricsEnabled
                  ? `Unlock wallet with ${defaultTypeLabel}`
                  : `Enable ${defaultTypeLabel} for quick access`
              }
              showArrow={false}
              onPress={() => handleBiometricToggle(!isBiometricsEnabled)}
              styles={styles}
              theme={theme}
              rightComponent={
                <View style={styles.switchContainer}>
                  <Switch
                    value={isBiometricsEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{
                      false: theme.background.secondary,
                      true: theme.primary[400],
                    }}
                    thumbColor={theme.neutral.white.base}
                    disabled={isEnablingBiometrics}
                  />
                </View>
              }
            />
          )}
          <SettingItem
            title="Change Password"
            subtitle="Update your wallet password"
            onPress={handleChangePassword}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Wallet Section */}
        <SectionHeader title="Wallet" styles={styles} />
        <View style={styles.section}>
          <SettingItem
            title="Show Recovery Phrase"
            subtitle="View your wallet's seed phrase"
            onPress={handleShowRecoveryPhrase}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" styles={styles} />
        <View style={styles.section}>
          <SettingItem
            title="Version"
            subtitle="1.0.0"
            showArrow={false}
            styles={styles}
            theme={theme}
          />
          <SettingItem
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Terms of Service')}
            styles={styles}
            theme={theme}
          />
          <SettingItem
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy Policy')}
            styles={styles}
            theme={theme}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" styles={styles} />
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={handleResetWallet}
          >
            <Text style={styles.dangerItemText}>Reset Wallet</Text>
            <RcArrowRightCC width={20} height={20} color={theme.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Purro Wallet - Your Gateway to Hyperliquid
          </Text>
          <Text style={styles.footerTextSmall}>Made with ❤️ for DeFi</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
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
      borderBottomColor: 'rgba(106, 114, 130, 0.1)',
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 24,
      height: 24,
      backgroundColor: theme.text.secondary,
      borderRadius: BorderRadius.md,
    },
    headerTitle: {
      ...Typography.h4,
      fontSize: 20,
      color: theme.text.primary,
    },
    headerRight: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: Spacing.xxl,
    },
    sectionHeader: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.md - 4,
    },
    sectionTitle: {
      ...Typography.label14,
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    section: {
      backgroundColor: theme.background.secondary,
      marginHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(106, 114, 130, 0.1)',
    },
    settingItemLeft: {
      flex: 1,
      gap: 4,
    },
    settingItemTitle: {
      ...Typography.body,
      fontSize: 16,
      color: theme.text.primary,
    },
    settingItemSubtitle: {
      ...Typography.label14,
      color: theme.text.secondary,
    },
    settingItemArrow: {
      width: 20,
      height: 20,
      backgroundColor: theme.text.secondary,
      borderRadius: 10,
      marginLeft: Spacing.md - 4,
    },
    switchContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm,
      minWidth: 51,
    },
    dangerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    dangerItemText: {
      ...Typography.body,
      fontSize: 16,
      color: theme.danger[400],
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      paddingTop: Spacing.xxl,
      paddingBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    footerText: {
      ...Typography.label14,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    footerTextSmall: {
      ...Typography.label14,
      color: theme.text.secondary,
      textAlign: 'center',
    },
  });

export default SettingsScreen;
