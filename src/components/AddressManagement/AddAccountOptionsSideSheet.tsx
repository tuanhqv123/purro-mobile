import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { useTheme, Typography } from '@/theme';
import { useTranslation } from '@/utils/i18n';
import { RcNextLeftCC, RcWalletCC } from '@/assets/icons/common';

interface AddAccountOptionsSideSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateNewAccount: () => void;
  onImportSeedPhrase: () => void;
  onImportPrivateKey: () => void;
}

export const AddAccountOptionsSideSheet: React.FC<
  AddAccountOptionsSideSheetProps
> = ({
  visible,
  onClose,
  onCreateNewAccount,
  onImportSeedPhrase,
  onImportPrivateKey,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const slideAnim = React.useRef(new Animated.Value(400)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleOption = (action: () => void) => {
    action();
    onClose();
  };

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
            styles.sideSheet,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
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
              onPress={() => handleOption(onCreateNewAccount)}
            >
              <View style={styles.optionIcon}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>+</Text>
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  {t(
                    'account.management.addAccountOptions.createNewAccount.title',
                  )}
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
                  {t(
                    'account.management.addAccountOptions.importSeedPhrase.title',
                  )}
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
                  <RcWalletCC
                    width={20}
                    height={20}
                    color={theme.primary[600]}
                  />
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
          </View>
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
      flexDirection: 'row',
    },
    backdrop: {
      flex: 1,
    },
    sideSheet: {
      width: 402,
      height: '100%',
      backgroundColor: theme.background.primary,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.surface.header,
      borderTopLeftRadius: 20,
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
