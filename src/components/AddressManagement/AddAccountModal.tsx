import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme, Typography } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import { RcNextLeftCC, RcIconEyeCC, RcWalletCC } from '@/assets/icons/common';

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onDeriveFromHD: () => void;
  onImportPrivateKey: () => void;
  onCreateNewWallet: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onDeriveFromHD,
  onImportPrivateKey,
  onCreateNewWallet,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);

  const handleOption = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
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
              onPress={() => handleOption(onDeriveFromHD)}
            >
              <View style={styles.optionIcon}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>+</Text>
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {t('account.management.addAccountOptions.deriveFromHD.title')}
                </Text>
                <Text style={styles.optionDescription}>
                  {t(
                    'account.management.addAccountOptions.deriveFromHD.description',
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
                  {t(
                    'account.management.addAccountOptions.importPrivateKey.title',
                  )}
                </Text>
                <Text style={styles.optionDescription}>
                  {t(
                    'account.management.addAccountOptions.importPrivateKey.description',
                  )}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOption(onCreateNewWallet)}
            >
              <View style={styles.optionIcon}>
                <View style={styles.iconCircle}>
                  <RcIconEyeCC width={20} height={20} color={theme.primary[600]} />
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {t(
                    'account.management.addAccountOptions.importWatchOnly.title',
                  )}
                </Text>
                <Text style={styles.optionDescription}>
                  {t(
                    'account.management.addAccountOptions.importWatchOnly.description',
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    backdrop: {
      flex: 1,
    },
    bottomSheet: {
      backgroundColor: theme.background.primary,
      borderRadius: 20,
      width: '100%',
      maxWidth: 402,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.surface.header,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...Typography.label20,
      color: theme.text.primary,
    },
    placeholder: {
      width: 40,
    },
    optionsList: {
      padding: 20,
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
