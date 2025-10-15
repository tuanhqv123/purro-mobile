import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { apisAccount, AccountInfo } from '@/core/apis';
import { useTheme, Typography, Spacing, BorderRadius } from '@/theme';
import type { HomeScreenProps } from '@/types/navigation';
import { useMarketTokens } from '@/hooks/market/useMarketTokens';
import { MarketTokenItem } from '@/types/market';
import { formatPriceUSD, formatChangePercent } from '@/utils/number';
import { formatAddress } from '@/utils/address';
import { AccountManagementBottomSheet } from '@/components/AddressManagement';
import AppIcon from '@/assets/icons/purro-icon-dark.png';
import SendIcon from '@/assets/icons/home/send-cc.svg';
import ReceiveIcon from '@/assets/icons/home/receive-cc.svg';
import SwapIcon from '@/assets/icons/home/swap-cc.svg';
import BridgeIcon from '@/assets/icons/home/bridge-cc.svg';
import SettingsIcon from '@/assets/icons/home/header-settings-cc.svg';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [currentAccount, setCurrentAccount] = useState<AccountInfo | null>(
    null,
  );
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const { tokens, loading, error } = useMarketTokens();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const accounts = await apisAccount.getAllAccounts();
      if (accounts && accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      }
    } catch (err) {}
  };

  const handleSelectAccount = (account: AccountInfo) => {
    setCurrentAccount(account);
  };

  // handleAddAccount is no longer needed as AccountManagementSheet handles this internally

  const handleCreateNewAccount = async () => {
    try {
      if (!currentAccount || currentAccount.type !== 'HD Key Tree') {
        Alert.alert('Error', 'Please select an HD wallet account first');
        return;
      }

      const keyringIndex = currentAccount.keyringIndex ?? 0;
      const nextIndex =
        currentAccount.index !== undefined ? currentAccount.index + 1 : 1;

      const newAddress = await apisAccount.addAccountFromHD(
        keyringIndex,
        nextIndex,
      );

      await loadWalletData();
      Alert.alert(
        'Success',
        `Account ${nextIndex + 1} created: ${newAddress.slice(0, 10)}...`,
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to create account',
      );
    }
  };

  const handleImportSeedPhrase = () => {
    navigation.navigate('Import' as any);
  };

  const handleImportPrivateKey = () => {
    navigation.navigate('ImportPrivateKey');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => setShowAccountManagement(true)}
        >
          <Image source={AppIcon} style={styles.logoAvatar} />
          <View>
            <Text style={styles.headerTitle}>Purro Wallet</Text>
            {currentAccount && (
              <Text style={styles.addressText}>
                {formatAddress(currentAccount.address)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <SettingsIcon width={24} height={24} color={theme.primary[400]} />
        </TouchableOpacity>
      </View>

      {/* Balance area (centered) */}
      <View style={styles.balanceCenteredArea}>
        <Text style={styles.balanceAmount}>$254.48</Text>
      </View>

      {/* Action buttons - square style per Figma */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Send', 'Coming soon')}
        >
          <SendIcon width={28} height={28} color={theme.primary[400]} />
          <Text style={styles.actionSquareText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Receive', 'Coming soon')}
        >
          <ReceiveIcon width={28} height={28} color={theme.primary[400]} />
          <Text style={styles.actionSquareText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Swap', 'Coming soon')}
        >
          <SwapIcon width={28} height={28} color={theme.primary[400]} />
          <Text style={styles.actionSquareText}>Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Bridge', 'Coming soon')}
        >
          <BridgeIcon width={28} height={28} color={theme.primary[400]} />
          <Text style={styles.actionSquareText}>Bridge</Text>
        </TouchableOpacity>
      </View>

      {/* Assets Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assets</Text>
      </View>
    </>
  );

  const renderAssetItem = ({ item }: { item: MarketTokenItem }) => (
    <View style={styles.assetCard}>
      <View style={styles.assetCardHeader}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.assetLogo} />
        ) : (
          <View style={styles.assetLogoPlaceholder} />
        )}
        <Text style={styles.assetSymbol}>{item.symbol}</Text>
      </View>
      <View style={styles.assetCardBody}>
        <Text style={styles.assetPriceText}>
          {formatPriceUSD(item.priceUsd, { digits: 4 })}
        </Text>
        <Text
          style={[
            styles.assetChangeText,
            item.change24h !== null && item.change24h >= 0
              ? { color: theme.success[400] }
              : { color: theme.danger[400] },
          ]}
        >
          {formatChangePercent(item.change24h)}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No Assets Yet</Text>
      <Text style={styles.emptyDescription}>
        Your tokens will appear here once you receive them
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Failed to load assets</Text>
      <Text style={styles.emptyDescription}>{error}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainerInline}>
      <ActivityIndicator size="small" color={theme.primary[400]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.container}>
          {renderHeader()}
          {renderLoadingState()}
        </View>
      ) : error ? (
        <View style={styles.container}>
          {renderHeader()}
          {renderErrorState()}
        </View>
      ) : tokens.length === 0 ? (
        <View style={styles.container}>
          {renderHeader()}
          {renderEmptyState()}
        </View>
      ) : (
        <FlatList
          key="assets-grid-2-columns"
          data={tokens}
          keyExtractor={item => item.id}
          renderItem={renderAssetItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

      <AccountManagementBottomSheet
        visible={showAccountManagement}
        onClose={() => setShowAccountManagement(false)}
        currentAddress={currentAccount?.address}
        onSelectAccount={handleSelectAccount}
        onCreateNewAccount={handleCreateNewAccount}
        onImportSeedPhrase={handleImportSeedPhrase}
        onImportPrivateKey={handleImportPrivateKey}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    flatListContent: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    columnWrapper: {
      gap: Spacing.sm + 2,
      marginBottom: Spacing.sm + 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md - 4,
    },
    logoAvatar: {
      width: 40,
      height: 40,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.primary[400],
    },
    headerTitle: {
      ...Typography.h4,
      fontSize: 20,
      color: theme.text.primary,
    },
    addressText: {
      ...Typography.label14,
      fontSize: 12,
      color: theme.text.secondary,
    },
    settingsButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    balanceCenteredArea: {
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    balanceAmount: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
      textAlign: 'center',
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    actionSquare: {
      flex: 1,
      backgroundColor: theme.background.secondary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md - 4,
      alignItems: 'center',
      gap: Spacing.sm,
    },
    actionSquareText: {
      ...Typography.label14,
      color: theme.primary[400],
    },
    sectionHeader: {
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      ...Typography.body,
      fontSize: 20,
      fontWeight: '600',
      color: theme.text.primary,
    },
    emptyState: {
      backgroundColor: theme.background.secondary,
      borderRadius: BorderRadius.md,
      padding: Spacing.xxl,
      alignItems: 'center',
      gap: Spacing.md - 4,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(106, 114, 130, 0.2)',
      marginBottom: Spacing.sm,
    },
    emptyTitle: {
      ...Typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
    },
    emptyDescription: {
      ...Typography.label14,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    loadingContainerInline: {
      paddingVertical: Spacing.lg,
      alignItems: 'center',
    },
    assetCard: {
      flex: 1,
      backgroundColor: theme.surface.primary,
      borderRadius: Spacing.sm + 2,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      minHeight: 100,
      gap: Spacing.md - 2,
    },
    assetCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm + 2,
    },
    assetLogo: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    assetLogoPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(106,114,130,0.12)',
    },
    assetSymbol: {
      ...Typography.label16,
      color: theme.text.primary,
      fontWeight: '600',
    },
    assetCardBody: {
      flex: 1,
      justifyContent: 'flex-end',
      gap: 4,
    },
    assetPriceText: {
      ...Typography.body,
      color: theme.text.primary,
      fontWeight: '600',
      fontSize: 16,
    },
    assetChangeText: {
      ...Typography.label14,
      fontSize: 12,
    },
  });

export default HomeScreen;
