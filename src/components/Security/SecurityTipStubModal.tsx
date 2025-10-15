import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme, Typography } from '@/theme';
import { useTranslation } from '@/utils/i18n';

export default function SecurityTipStubModal({
  visible = false,
  onOk,
}: {
  visible?: boolean;
  onOk?: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="#161616"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modal}
          onPress={() => {}}
        >
          <View style={styles.container}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
            <Text style={styles.title}>
              {t('seedPhrase.display.securityNotice.title')}
            </Text>
            <Text style={styles.message}>
              {t('seedPhrase.display.securityNotice.message')}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                onOk?.();
              }}
            >
              <Text style={styles.buttonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
}

export function GlobalSecurityTipStubModal() {
  // TODO: Implement screen recording detection and security tips
  // For now, return null to keep the app working
  return null;
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.background.primary,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      alignItems: 'center',
      maxWidth: 320,
      borderWidth: 1,
      borderColor: theme.border.separator,
    },
    icon: {
      marginBottom: 16,
    },
    iconText: {
      fontSize: 48,
    },
    title: {
      ...Typography.label20,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: theme.text.primary,
    },
    message: {
      ...Typography.body,
      textAlign: 'center',
      marginBottom: 24,
      color: theme.text.secondary,
    },
    button: {
      backgroundColor: theme.primary[400],
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      ...Typography.label16,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
