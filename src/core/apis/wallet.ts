import { keyringService } from '../services/keyring';
import { lockService } from '../services/lock';
import { secureKeychain } from '../services/keychain';
import { keyringStorage } from '../storage/secureStorage';

export interface WalletAccount {
  address: string;
  balance?: string;
}

export const apisWallet = {
  // ============ Wallet Creation & Management ============

  async createWallet(
    password: string,
    mnemonic?: string,
  ): Promise<{ addresses: string[]; mnemonic: string }> {
    const mnemonicToUse = mnemonic || keyringService.generateMnemonic();

    // Boot keyring with temporary password
    await keyringService.boot('temp_password');

    // Create HD keyring
    const addresses = await keyringService.createHDKeyring(mnemonicToUse);

    // Persist with user password
    await keyringService.persistAllKeyrings(password);

    console.log(`✅ Wallet created with ${addresses.length} account(s)`);

    return { addresses, mnemonic: mnemonicToUse };
  },

  async importWallet(
    mnemonic: string,
    password: string,
    passphrase?: string,
  ): Promise<{ addresses: string[] }> {
    // Boot keyring service (don't load existing vault)
    console.time('🔧 Boot Keyring');
    if (!keyringService.isBooted()) {
      await keyringService.boot(password);
    }
    console.timeEnd('🔧 Boot Keyring');

    // Create HD keyring with mnemonic
    console.time('🔑 Create HD Keyring');
    const addresses = await keyringService.createHDKeyring(
      mnemonic,
      passphrase,
    );
    console.timeEnd('🔑 Create HD Keyring');

    // Persist with user password (optimized version)
    console.time('💾 Persist Keyrings');
    await keyringService.persistAllKeyrings(password);
    console.timeEnd('💾 Persist Keyrings');

    // Mark wallet as unlocked after successful import
    console.time('🔓 Mark Unlocked');
    lockService.markAsUnlocked();
    await lockService.updateUnlockTime();
    console.timeEnd('🔓 Mark Unlocked');

    return { addresses };
  },

  generateMnemonic(strength: number = 128): string {
    return keyringService.generateMnemonic(strength);
  },

  hasWallet(): boolean {
    const vault = keyringStorage.getItem<string>('vault');
    console.log(
      '🔍 hasWallet check - vault exists:',
      !!vault,
      'length:',
      vault?.length || 0,
    );
    return !!vault;
  },

  // ============ Account Management ============

  async addAccount(count: number = 1): Promise<string[]> {
    const newAddresses = await keyringService.addAccounts(count);

    // Persist changes
    const currentPassword = (keyringService as any).password;
    if (currentPassword) {
      await keyringService.persistAllKeyrings(currentPassword);
    }

    console.log(`✅ Added ${count} new account(s)`);
    return newAddresses;
  },

  getAllAccounts(): string[] {
    return keyringService.getAllAccounts();
  },

  getCurrentAccount(): WalletAccount | null {
    const currentAddress = keyringService.getCurrentAddress();

    if (!currentAddress) {
      const accounts = keyringService.getAllAccounts();
      if (accounts.length > 0) {
        return { address: accounts[0] };
      }
      return null;
    }

    return { address: currentAddress };
  },

  setCurrentAccount(address: string): void {
    keyringService.setCurrentAddress(address);
  },

  // ============ Lock / Unlock ============

  async unlockWallet(password: string) {
    return lockService.unlockWallet(password);
  },

  async unlockWithBiometrics() {
    return lockService.unlockWithBiometrics();
  },

  lockWallet(): void {
    lockService.lockWallet();
  },

  isLocked(): boolean {
    return lockService.isLocked();
  },

  // ============ Biometric Authentication ============

  async enableBiometrics(password: string): Promise<boolean> {
    return lockService.enableBiometrics(password);
  },

  async disableBiometrics(): Promise<boolean> {
    return lockService.disableBiometrics();
  },

  async getSupportedBiometryType() {
    return secureKeychain.getSupportedBiometryType();
  },

  isBiometricsEnabled(): boolean {
    return secureKeychain.isAuthenticatedByBiometrics();
  },

  async isBiometricsAvailable(): Promise<boolean> {
    return secureKeychain.isBiometricsAvailable();
  },

  // ============ Export / Backup ============

  async exportMnemonic(keyringIndex: number = 0): Promise<string> {
    if (!keyringService.isUnlocked()) {
      throw new Error('Wallet is locked');
    }

    return keyringService.exportMnemonic(keyringIndex);
  },

  async exportPrivateKey(address: string): Promise<string> {
    if (!keyringService.isUnlocked()) {
      throw new Error('Wallet is locked');
    }

    return keyringService.exportPrivateKey(address);
  },

  // ============ Password Management ============

  async updatePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await keyringService.updatePassword(oldPassword, newPassword);
    console.log('✅ Password updated successfully');
  },

  // ============ Wallet Reset ============

  resetWallet(): void {
    keyringService.clearAll();
    lockService.lockWallet();
    console.log('🗑️ Wallet reset - all data cleared');
  },

  // ============ Utility ============

  getAccountByAddress(address: string) {
    return keyringService.getAccountByAddress(address);
  },

  getFailedAttempts(): number {
    return lockService.getFailedAttempts();
  },

  getLockoutRemainingTime(): number {
    return lockService.getLockoutRemainingTime();
  },
};

export default apisWallet;
