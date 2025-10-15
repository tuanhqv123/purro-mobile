import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { apisAccount, AccountInfo } from '@/core/apis';
import { useTheme, Typography } from '@/theme';
import { useTranslation } from '@/utils/i18n';

interface AddressListBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  currentAddress?: string;
  onSelectAccount: (account: AccountInfo) => void;
  onAddAccount: () => void;
}

interface GroupedAccounts {
  hdAccounts: AccountInfo[];
  privateKeyAccounts: AccountInfo[];
}

export const AddressListBottomSheet: React.FC<AddressListBottomSheetProps> = ({
  visible,
  onClose,
  currentAddress,
  onSelectAccount,
  onAddAccount,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(true);
  const [groupedAccounts, setGroupedAccounts] = useState<GroupedAccounts>({
    hdAccounts: [],
    privateKeyAccounts: [],
  });

  useEffect(() => {
    if (visible) {
      loadAccounts();
    }
  }, [visible]);

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t('account.management.title')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary[400]} />
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
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
                    {groupedAccounts.privateKeyAccounts.map(
                      (account, index) => (
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
                                  `${t('account.management.imported')} ${
                                    index + 1
                                  }`}
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
                      ),
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.addButton} onPress={onAddAccount}>
            <Text style={styles.addButtonText}>
              + {t('account.management.addAccount')}
            </Text>
          </TouchableOpacity>
        </View>
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
  });
