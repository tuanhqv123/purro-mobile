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
import { Colors } from '@/constants/colors';
import { RcNextLeftCC, RcArrowRightCC } from '@/assets/icons/common';
import { Typography } from '@/constants/typography';
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
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightComponent,
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
        <RcArrowRightCC width={20} height={20} color={Colors.brand.primary} />
      ))}
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  useTranslation();
  const {
    computed: { isBiometricsEnabled, defaultTypeLabel, couldSetupBiometrics },
    toggleBiometrics,
    fetchBiometrics,
    biometrics,
  } = useBiometrics({ autoFetch: true });

  console.log('⚙️ Settings - Biometrics state:', {
    isBiometricsEnabled,
    defaultTypeLabel,
    couldSetupBiometrics,
    supportedBiometryType: biometrics.supportedBiometryType,
    authEnabled: biometrics.authEnabled,
  });

  // Force show toggle for debugging
  const forceShowToggle = true;

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

  const handleBackupWallet = () => {
    Alert.alert('Backup Wallet', 'Backup wallet feature coming soon', [
      { text: 'OK', style: 'default' },
    ]);
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
        backgroundColor={Colors.background.primary}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <RcNextLeftCC width={24} height={24} color={Colors.brand.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <SectionHeader title="Security" />
        <View style={styles.section}>
          {(couldSetupBiometrics || forceShowToggle) && (
            <SettingItem
              title={`${defaultTypeLabel} Authentication`}
              subtitle={
                isBiometricsEnabled
                  ? `Unlock wallet with ${defaultTypeLabel}`
                  : `Enable ${defaultTypeLabel} for quick access`
              }
              showArrow={false}
              onPress={() => handleBiometricToggle(!isBiometricsEnabled)}
              rightComponent={
                <View style={styles.switchContainer}>
                  <Switch
                    value={isBiometricsEnabled}
                    onValueChange={handleBiometricToggle}
                    trackColor={{
                      false: Colors.background.secondary,
                      true: Colors.brand.primary,
                    }}
                    thumbColor={Colors.system.white}
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
          />
        </View>

        {/* Wallet Section */}
        <SectionHeader title="Wallet" />
        <View style={styles.section}>
          <SettingItem
            title="Backup Wallet"
            subtitle="View your seed phrase"
            onPress={handleBackupWallet}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingItem title="Version" subtitle="1.0.0" showArrow={false} />
          <SettingItem
            title="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Terms of Service')}
          />
          <SettingItem
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy Policy')}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={handleResetWallet}
          >
            <Text style={styles.dangerItemText}>Reset Wallet</Text>
            <RcArrowRightCC
              width={20}
              height={20}
              color={Colors.brand.primary}
            />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    backgroundColor: Colors.text.secondary,
    borderRadius: 12,
  },
  headerTitle: {
    ...Typography.styles.h4,
    fontSize: 20,
    color: Colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
  },
  sectionTitle: {
    ...Typography.styles.label,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: Colors.background.secondary,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 114, 130, 0.1)',
  },
  settingItemLeft: {
    flex: 1,
    gap: 4,
  },
  settingItemTitle: {
    ...Typography.styles.body,
    fontSize: 16,
    color: Colors.text.primary,
  },
  settingItemSubtitle: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
  },
  settingItemArrow: {
    width: 20,
    height: 20,
    backgroundColor: Colors.text.secondary,
    borderRadius: 10,
    marginLeft: 12,
  },
  switchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8, // Thụt vào trái để không bị overflow
    minWidth: 51, // Đảm bảo có đủ không gian cho Switch
  },
  dangerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  dangerItemText: {
    ...Typography.styles.body,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    gap: 8,
  },
  footerText: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  footerTextSmall: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default SettingsScreen;
