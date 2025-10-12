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
import { apisWallet } from '@/core/apis/wallet';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import type { HomeScreenProps } from '@/types/navigation';
import { useMarketTokens } from '@/hooks/market/useMarketTokens';
import { formatPriceUSD, formatChangePercent } from '@/utils/number';
import AppIcon from '@/assets/icons/purro-icon-dark.png';
import SendIcon from '@/assets/icons/home/send-cc.svg';
import ReceiveIcon from '@/assets/icons/home/receive-cc.svg';
import SwapIcon from '@/assets/icons/home/swap-cc.svg';
import BridgeIcon from '@/assets/icons/home/bridge-cc.svg';
import SettingsIcon from '@/assets/icons/home/header-settings-cc.svg';

/**
 * HomeScreen - Main wallet screen following Figma design
 * Shows account balance, action buttons, and account management
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [_currentAccount, setCurrentAccount] = useState<any>(null);
  const { tokens, loading, error } = useMarketTokens();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const accounts = apisWallet.getAllAccounts();
      if (accounts && accounts.length > 0) {
        setCurrentAccount({
          address: accounts[0],
          name: 'Account 1',
        });
      }
    } catch (err) {
      console.error('Error loading wallet data:', err);
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  // address helpers kept for future use when address is displayed on Home

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={AppIcon} style={styles.logoAvatar} />
          <Text style={styles.headerTitle}>Purro Wallet</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <SettingsIcon width={24} height={24} color={Colors.brand.primary} />
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
          <SendIcon width={28} height={28} color={Colors.brand.primary} />
          <Text style={styles.actionSquareText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Receive', 'Coming soon')}
        >
          <ReceiveIcon width={28} height={28} color={Colors.brand.primary} />
          <Text style={styles.actionSquareText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Swap', 'Coming soon')}
        >
          <SwapIcon width={28} height={28} color={Colors.brand.primary} />
          <Text style={styles.actionSquareText}>Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => Alert.alert('Bridge', 'Coming soon')}
        >
          <BridgeIcon width={28} height={28} color={Colors.brand.primary} />
          <Text style={styles.actionSquareText}>Bridge</Text>
        </TouchableOpacity>
      </View>

      {/* Assets Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assets</Text>
      </View>
    </>
  );

  const renderAssetItem = ({ item }: { item: any }) => (
    <View style={styles.assetRow}>
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.assetLogo} />
      ) : (
        <View style={styles.assetLogoPlaceholder} />
      )}
      <View style={styles.assetMeta}>
        <Text style={styles.assetSymbol}>{item.symbol}</Text>
        <Text style={styles.assetName}>{item.name}</Text>
      </View>
      <View style={styles.assetPrice}>
        <Text style={styles.assetPriceText}>
          {formatPriceUSD(item.priceUsd, { digits: 4 })}
        </Text>
        <Text
          style={[
            styles.assetChangeText,
            item.change24h !== null && item.change24h >= 0
              ? { color: Colors.system.success }
              : { color: Colors.system.error },
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
      <ActivityIndicator size="small" color={Colors.brand.primary} />
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
          data={tokens}
          keyExtractor={item => item.id}
          renderItem={renderAssetItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brand.primary,
  },
  logoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  headerTitle: {
    ...Typography.styles.h4,
    fontSize: 20,
    color: Colors.text.primary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    backgroundColor: Colors.text.secondary,
    borderRadius: 12,
  },
  balanceCenteredArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  balanceUsd: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  actionSquare: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionSquareIcon: {
    width: 28,
    height: 28,
    backgroundColor: Colors.brand.primary,
    borderRadius: 6,
  },
  actionSquareText: {
    ...Typography.styles.label,
    color: Colors.brand.primary,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.styles.body,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptyState: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(106, 114, 130, 0.2)',
    marginBottom: 8,
  },
  emptyTitle: {
    ...Typography.styles.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptyDescription: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainerInline: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginBottom: 10,
  },
  assetLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  assetLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106,114,130,0.12)',
  },
  assetMeta: {
    marginLeft: 12,
    flex: 1,
  },
  assetSymbol: {
    ...Typography.styles.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  assetName: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
    fontSize: 12,
  },
  assetPrice: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  assetPriceText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  assetChangeText: {
    ...Typography.styles.caption,
    marginTop: 4,
  },
});

export default HomeScreen;
