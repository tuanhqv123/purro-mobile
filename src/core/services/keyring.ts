import {
  HDKeyring,
  HDKeyringData,
  generateMnemonic,
  validateMnemonic,
} from './hdKeyring';
import { SimpleKeyring, SimpleKeyringData } from './simpleKeyring';
import { appEncryptor } from './encryptor';
import { keyringStorage } from '../storage/secureStorage';

export interface KeyringData {
  hdKeyrings: HDKeyringData[];
  simpleKeyrings: SimpleKeyringData[];
  currentAddress?: string;
}

class KeyringService {
  private booted = false;
  private unlocked = false;
  private password = '';
  private hdKeyrings: HDKeyring[] = [];
  private simpleKeyrings: SimpleKeyring[] = [];
  private keyringData: KeyringData = { hdKeyrings: [], simpleKeyrings: [] };
  private passwordVerified = false;

  async boot(password: string): Promise<void> {
    if (this.booted) {
      if (this.password === password && this.passwordVerified && this.unlocked) {
        return;
      }
      
      if (this.password === password && this.passwordVerified && !this.unlocked) {
        try {
          await this.loadKeyring(password);
          this.unlocked = true;
          return;
        } catch (error) {
          throw error;
        }
      }
      
      await this.verifyPassword(password);
      await this.loadKeyring(password);
      this.unlocked = true;
      return;
    }

    this.password = password;
    this.passwordVerified = false;

    try {
      await this.loadKeyring(password);
      this.passwordVerified = true;
      this.unlocked = true;
    } catch (error) {
      this.keyringData = { hdKeyrings: [], simpleKeyrings: [] };
      this.passwordVerified = false;
    }

    this.booted = true;
  }

  isBooted(): boolean {
    return this.booted;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  hasPassword(): boolean {
    return !!this.password && this.passwordVerified;
  }

  getPassword(): string | null {
    if (!this.unlocked) {
      return null;
    }
    return this.password;
  }

  async setPassword(password: string): Promise<void> {
    if (this.hasPassword()) {
      throw new Error('Password already set. Use updatePassword to change it.');
    }
    this.password = password;
    this.passwordVerified = true;
    this.booted = true;
    this.unlocked = true;
    this.keyringData = { hdKeyrings: [], simpleKeyrings: [] };
    await this.persistAllKeyrings(password);
  }

  generateMnemonic(strength: number = 128): string {
    return generateMnemonic(strength);
  }

  async createHDKeyring(
    mnemonic: string,
    passphrase?: string,
  ): Promise<string[]> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    const trimmedInput = mnemonic.trim();
    const isPrivateKey = /^(0x)?[0-9a-fA-F]{64}$/.test(trimmedInput);

    if (isPrivateKey) {
      return this.createSimpleKeyring(trimmedInput);
    }

    if (!validateMnemonic(trimmedInput)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const keyring = new HDKeyring({
      mnemonic: trimmedInput,
      passphrase,
      numberOfAccounts: 1,
    });

    this.hdKeyrings.push(keyring);
    this.unlocked = true;

    const addresses = keyring.getAccounts();

    if (addresses.length > 0 && !this.keyringData.currentAddress) {
      this.keyringData.currentAddress = addresses[0];
    }

    return addresses;
  }

  async createSimpleKeyring(privateKey: string): Promise<string[]> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    let keyring = this.simpleKeyrings[0];
    if (!keyring) {
      keyring = new SimpleKeyring();
      this.simpleKeyrings.push(keyring);
    }

    const address = keyring.addAccount(privateKey);
    this.unlocked = true;

    if (!this.keyringData.currentAddress) {
      this.keyringData.currentAddress = address;
    }

    return [address];
  }

  async createKeyring(mnemonic: string): Promise<string[]> {
    return this.createHDKeyring(mnemonic);
  }

  async addAccounts(count: number = 1): Promise<string[]> {
    if (!this.unlocked) {
      throw new Error('Keyring is locked');
    }

    if (this.hdKeyrings.length === 0) {
      throw new Error('No HD keyring available');
    }

    // Add accounts to the first HD keyring
    return this.hdKeyrings[0].addAccounts(count);
  }

  getAllAccounts(): string[] {
    const hdAccounts = this.hdKeyrings.flatMap(kr => kr.getAccounts());
    const simpleAccounts = this.simpleKeyrings.flatMap(kr => kr.getAccounts());
    return [...hdAccounts, ...simpleAccounts];
  }

  getAccounts(): string[] {
    return this.getAllAccounts();
  }

  getAccountByAddress(address: string): any | null {
    for (const keyring of this.hdKeyrings) {
      const account = keyring.getAccountByAddress(address);
      if (account) {
        return account;
      }
    }
    for (const keyring of this.simpleKeyrings) {
      const account = keyring.getAccountByAddress(address);
      if (account) {
        return account;
      }
    }
    return null;
  }

  getPrivateKeyByAddress(address: string): string | null {
    const account = this.getAccountByAddress(address);
    return account ? account.privateKey : null;
  }

  exportPrivateKey(address: string): string {
    if (!this.unlocked) {
      throw new Error('Keyring is locked');
    }

    for (const keyring of this.hdKeyrings) {
      const account = keyring.getAccountByAddress(address);
      if (account) {
        return account.privateKey;
      }
    }

    throw new Error('Account not found');
  }

  exportMnemonic(keyringIndex: number = 0): string {
    if (!this.unlocked) {
      throw new Error('Keyring is locked');
    }

    if (this.hdKeyrings.length === 0) {
      throw new Error('No HD keyring available. This wallet may have been imported with a private key.');
    }

    if (keyringIndex >= this.hdKeyrings.length) {
      throw new Error('Keyring not found');
    }

    return this.hdKeyrings[keyringIndex].getMnemonic();
  }

  hasHDKeyring(): boolean {
    return this.hdKeyrings.length > 0;
  }

  getHDKeyrings(): HDKeyring[] {
    return this.hdKeyrings;
  }

  getSimpleKeyrings(): SimpleKeyring[] {
    return this.simpleKeyrings;
  }

  getHDKeyringByMnemonic(mnemonic: string): HDKeyring | undefined {
    return this.hdKeyrings.find(keyring => {
      const serialized = keyring.serialize();
      return serialized.mnemonic === mnemonic;
    });
  }

  getHDKeyringByIndex(index: number): HDKeyring | undefined {
    return this.hdKeyrings.find(keyring => {
      const serialized = keyring.serialize();
      return serialized.index === index;
    });
  }

  updateHDKeyringIndex(keyring: HDKeyring): void {
    const maxIndex = this.hdKeyrings.reduce((max, kr) => {
      const serialized = kr.serialize();
      return Math.max(max, serialized.index || 0);
    }, -1);

    const serialized = keyring.serialize();
    if (serialized.index === undefined || serialized.index === 0) {
      keyring.index = maxIndex + 1;
    }
  }

  async persistAllKeyrings(password: string): Promise<void> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    try {
      const data: KeyringData = {
        hdKeyrings: this.hdKeyrings.map(kr => kr.serialize()),
        simpleKeyrings: this.simpleKeyrings.map(kr => kr.serialize()),
        currentAddress: this.keyringData.currentAddress,
      };

      if (data.hdKeyrings.length === 0 && data.simpleKeyrings.length === 0) {
        throw new Error('No keyring data to save');
      }

      const encrypted = await appEncryptor.encrypt(password, data);
      keyringStorage.setItem('vault', encrypted);

      this.password = password;
    } catch (error) {
      throw new Error(
        `Failed to save wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async loadKeyring(password: string): Promise<void> {
    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      this.keyringData = { hdKeyrings: [], simpleKeyrings: [] };
      return;
    }

    const decrypted = await appEncryptor.decrypt(password, encryptedVault);
    this.keyringData = decrypted;

    this.hdKeyrings = (decrypted.hdKeyrings || []).map(
      (data: HDKeyringData) => {
        if (data.numberOfAccounts && !data.activeIndexes) {
          const numberOfAccounts = data.numberOfAccounts;
          data.activeIndexes = Array.from(
            { length: numberOfAccounts },
            (_, i) => i,
          );
          data.hdPath = "m/44'/60'/0'/0";
          data.accountDetails = {};
          data.byImport = true;
          data.index = 0;
        }
        return new HDKeyring(data);
      },
    );

    this.simpleKeyrings = (decrypted.simpleKeyrings || []).map(
      (data: SimpleKeyringData) => new SimpleKeyring(data),
    );

    this.unlocked = true;
  }

  async verifyPassword(password: string): Promise<void> {
    if (this.passwordVerified && this.password === password) {
      return;
    }

    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      throw new Error('No vault found');
    }

    try {
      await appEncryptor.decrypt(password, encryptedVault);
      this.passwordVerified = true;
    } catch (error) {
      throw new Error('Incorrect password');
    }
  }

  async submitPassword(password: string): Promise<void> {
    if (!this.passwordVerified || this.password !== password) {
      await this.verifyPassword(password);
    }

    this.password = password;
    this.unlocked = true;
  }

  async updatePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.verifyPassword(oldPassword);
    await this.persistAllKeyrings(newPassword);
    this.password = newPassword;
  }

  async resetPassword(newPassword: string): Promise<void> {
    this.keyringData = { hdKeyrings: [], simpleKeyrings: [] };
    this.hdKeyrings = [];
    this.simpleKeyrings = [];
    await this.persistAllKeyrings(newPassword);
    this.password = newPassword;
  }

  async dangerouslyResetPasswordAndKeyrings(
    oldPassword: string,
    newPassword?: string,
  ): Promise<void> {
    await this.verifyPassword(oldPassword);
    this.hdKeyrings = [];
    this.simpleKeyrings = [];
    this.keyringData = { hdKeyrings: [], simpleKeyrings: [] };
    if (newPassword) {
      await this.persistAllKeyrings(newPassword);
    } else {
      keyringStorage.removeItem('vault');
    }
  }

  getCurrentAddress(): string | undefined {
    return this.keyringData.currentAddress;
  }

  setCurrentAddress(address: string): void {
    const allAccounts = this.getAllAccounts();
    if (!allAccounts.includes(address)) {
      throw new Error('Address not found in keyrings');
    }
    this.keyringData.currentAddress = address;
  }

  lock(): void {
    this.unlocked = false;
  }

  clearAll(): void {
    this.hdKeyrings = [];
    this.simpleKeyrings = [];
    this.keyringData = { hdKeyrings: [], simpleKeyrings: [] };
    this.unlocked = false;
    this.password = '';
    this.booted = false;
    keyringStorage.removeItem('vault');
  }

  async getCountOfAccountsInKeyring(): Promise<number> {
    return this.getAllAccounts().length;
  }
}

export const keyringService = new KeyringService();
