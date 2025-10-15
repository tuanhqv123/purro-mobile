import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { apisAccount, AccountInfo } from '@/core/apis';
import { useTheme, Typography } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import { RcNextLeftCC, RcWalletCC } from '@/assets/icons/common';

type SheetView = 'accountList' | 'addAccountOptions';

interface AccountManagementSheetProps {
  visible: boolean;
  onClose: () => void;
  currentAddress?: string;
  onSelectAccount: (account: AccountInfo) => void;
  onCreateNewAccount: () => void;
  onImportSeedPhrase: () => void;
  onImportPrivateKey: () => void;
}

interface GroupedAccounts {
  hdAccounts: AccountInfo[];
  privateKeyAccounts: AccountInfo[];
}

export const AccountManagementSheet: React.FC<AccountManagementSheetProps> = ({
  visible,
  onClose,
  currentAddress,
  onSelectAccount,
  onCreateNewAccount,
  onImportSeedPhrase,
  onImportPrivateKey,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const [currentView, setCurrentView] = useState<SheetView>('accountList');
  const [loading, setLoading] = useState(true);
  const [groupedAccounts, setGroupedAccounts] = useState<GroupedAccounts>({
    hdAccounts: [],
    privateKeyAccounts: [],
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(0);
      fadeAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      loadAccounts();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  useEffect(() => {
    if (visible && currentView === 'addAccountOptions') {
      // Animate slide from right
      slideAnim.setValue(400);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentView, visible, slideAnim]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const allAccounts = await apisAccount.getAllAccounts();

      const grouped: GroupedAccounts = {
        hdAccounts: allAccounts.filter(acc => acc.type === 'HD Key Tree'),
        privateKeyAccounts: allAccounts.filter(
          acc => acc.type === 'Simple Key Pair',
        ),
      };
      setGroupedAccounts(grouped);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account: AccountInfo) => {
    onSelectAccount(account);
    onClose();
  };

  const handleAddAccount = () => {
    setCurrentView('addAccountOptions');
  };

  const handleBack = () => {
    // Animate slide to right
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentView('accountList');
      // Reset animation for next show
      slideAnim.setValue(0);
    });
  };

  const handleOption = (action: () => void) => {
    action();
    onClose();
    // Reset view for next time
    setCurrentView('accountList');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSlideAnimation = () => {
    if (currentView === 'accountList') {
      return {
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [800, 0],
            }),
          },
        ],
      };
    } else {
      return {
        transform: [
          {
            translateX: slideAnim,
          },
        ],
      };
    }
  };

  const renderAccountList = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('account.management.title')}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary[400]} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {groupedAccounts.hdAccounts.length > 0 && (
            <View style={styles.accountsSection}>
              <Text style={styles.sectionTitle}>
                {t('account.management.hdWalletAccounts')}
              </Text>
              <View style={styles.accountList}>
                {groupedAccounts.hdAccounts.map((account, index) => (
                  <TouchableOpacity
                    key={`hd-${account.address}`}
                    style={[
                      styles.accountItem,
                      currentAddress === account.address &&
                        styles.accountItemActive,
                    ]}
                    onPress={() => handleSelectAccount(account)}
                  >
                    <View style={styles.accountLeft}>
                      <View style={styles.accountAvatar}>
                        <Text style={styles.avatarText}>
                          {(account.index !== undefined
                            ? account.index + 1
                            : index + 1
                          )
                            .toString()
                            .slice(0, 2)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.accountName}>
                          {account.aliasName ||
                            `${t('account.management.account')} ${
                              (account.index !== undefined
                                ? account.index
                                : index) + 1
                            }`}
                        </Text>
                        <Text style={styles.accountAddress}>
                          {formatAddress(account.address)}
                        </Text>
                        {account.hdPathType && (
                          <Text style={styles.accountPath}>
                            {account.hdPathType}
                          </Text>
                        )}
                      </View>
                    </View>

                    {currentAddress === account.address && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {groupedAccounts.privateKeyAccounts.length > 0 && (
            <View style={styles.accountsSection}>
              <Text style={styles.sectionTitle}>
                {t('account.management.importedAccounts')}
              </Text>
              <View style={styles.accountList}>
                {groupedAccounts.privateKeyAccounts.map((account, index) => (
                  <TouchableOpacity
                    key={`pk-${account.address}`}
                    style={[
                      styles.accountItem,
                      currentAddress === account.address &&
                        styles.accountItemActive,
                    ]}
                    onPress={() => handleSelectAccount(account)}
                  >
                    <View style={styles.accountLeft}>
                      <View style={styles.accountAvatar}>
                        <Text style={styles.avatarText}>🔑</Text>
                      </View>
                      <View>
                        <Text style={styles.accountName}>
                          {account.aliasName ||
                            `${t('account.management.imported')} ${index + 1}`}
                        </Text>
                        <Text style={styles.accountAddress}>
                          {formatAddress(account.address)}
                        </Text>
                      </View>
                    </View>

                    {currentAddress === account.address && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
        <Text style={styles.addButtonText}>
          + {t('account.management.addAccount')}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderAddAccountOptions = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <RcNextLeftCC width={24} height={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {t('account.management.addAccountOptions.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.optionsList}>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleOption(onCreateNewAccount)}
        >
          <View style={styles.optionIcon}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>+</Text>
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              {t('account.management.addAccountOptions.createNewAccount.title')}
            </Text>
            <Text style={styles.optionDescription}>
              {t(
                'account.management.addAccountOptions.createNewAccount.description',
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleOption(onImportSeedPhrase)}
        >
          <View style={styles.optionIcon}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📝</Text>
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              {t('account.management.addAccountOptions.importSeedPhrase.title')}
            </Text>
            <Text style={styles.optionDescription}>
              {t(
                'account.management.addAccountOptions.importSeedPhrase.description',
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleOption(onImportPrivateKey)}
        >
          <View style={styles.optionIcon}>
            <View style={styles.iconCircle}>
              <RcWalletCC width={20} height={20} color={theme.primary[600]} />
            </View>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              {t('account.management.addAccountOptions.importPrivateKey.title')}
            </Text>
            <Text style={styles.optionDescription}>
              {t(
                'account.management.addAccountOptions.importPrivateKey.description',
              )}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.bottomSheet,
            getSlideAnimation(),
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {currentView === 'accountList'
            ? renderAccountList()
            : renderAddAccountOptions()}
        </Animated.View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    backdrop: {
      flex: 1,
    },
    bottomSheet: {
      backgroundColor: theme.background.primary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: 800,
      width: 402,
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.surface.header,
      height: 72,
    },
    headerTitle: {
      ...Typography.h5,
      color: theme.text.primary,
    },
    closeButton: {
      fontSize: 24,
      color: theme.text.secondary,
      paddingHorizontal: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...Typography.label20,
      fontWeight: '500',
      color: theme.text.primary,
    },
    placeholder: {
      width: 40,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    content: {
      maxHeight: 400,
    },
    accountsSection: {
      padding: 20,
    },
    sectionTitle: {
      ...Typography.label14,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    accountList: {
      gap: 8,
    },
    accountItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.surface.primary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border.separator,
      height: 64,
    },
    accountItemActive: {
      borderColor: theme.primary[400],
      backgroundColor: 'rgba(5, 146, 136, 0.1)',
    },
    accountLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    accountAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...Typography.label16,
      fontWeight: '600',
      color: theme.primary[600],
    },
    accountName: {
      ...Typography.label16,
      fontWeight: '500',
      color: theme.text.primary,
      marginBottom: 4,
    },
    accountAddress: {
      ...Typography.label14,
      color: theme.text.secondary,
    },
    accountPath: {
      fontSize: 12,
      color: theme.primary[400],
      marginTop: 2,
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.primary[400],
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmarkText: {
      ...Typography.label16,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    addButton: {
      position: 'absolute',
      left: 24,
      bottom: 24,
      width: 354,
      height: 44,
      backgroundColor: theme.primary[400],
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      ...Typography.label16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    optionsList: {
      padding: 20,
      flex: 1,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface.primary,
      marginBottom: 8,
      height: 72,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primary[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.primary[600],
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      ...Typography.body,
      color: theme.text.primary,
      marginBottom: 8,
    },
    optionDescription: {
      ...Typography.label14,
      color: theme.text.secondary,
    },
  });
