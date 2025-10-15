import { Wallet, utils } from 'ethers';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';

const { getAddress } = utils;

export type HDPathType = 'BIP44' | 'Legacy' | 'LedgerLive';

export interface AccountDetail {
  hdPath: string;
  hdPathType: HDPathType;
  hdPathBasePublicKey: string;
  index: number;
}

export interface HDKeyringOptions {
  mnemonic?: string;
  passphrase?: string;
  numberOfAccounts?: number;
  activeIndexes?: number[];
  hdPath?: string;
  accountDetails?: Record<string, AccountDetail>;
  byImport?: boolean;
  index?: number;
}

export interface HDKeyringData {
  mnemonic: string;
  passphrase: string;
  numberOfAccounts?: number;
  accounts: string[];
  activeIndexes: number[];
  hdPath: string;
  accountDetails: Record<string, AccountDetail>;
  byImport: boolean;
  index: number;
}

export const generateMnemonic = (strength: number = 128): string => {
  return bip39.generateMnemonic(wordlist, strength);
};

export const validateMnemonic = (mnemonic: string): boolean => {
  return bip39.validateMnemonic(mnemonic, wordlist);
};

export class HDKeyring {
  private mnemonic: string;
  private passphrase: string;
  private wallets: Wallet[] = [];
  private hdKey: HDKey;
  private activeIndexes: number[] = [];
  private hdPath: string = "m/44'/60'/0'/0";
  private accountDetails: Record<string, AccountDetail> = {};
  byImport: boolean = false;
  index: number = 0;

  constructor(options: HDKeyringOptions = {}) {
    this.mnemonic = options.mnemonic || generateMnemonic();
    this.passphrase = options.passphrase || '';
    this.byImport = options.byImport || false;
    this.index = options.index || 0;

    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    this.hdKey = HDKey.fromMasterSeed(seed);

    if (options.hdPath) {
      this.hdPath = options.hdPath;
    }

    if (options.accountDetails) {
      this.accountDetails = options.accountDetails;
    }

    if (options.activeIndexes && options.activeIndexes.length > 0) {
      this.activeIndexes = options.activeIndexes;
      for (const index of options.activeIndexes) {
        this.deriveWalletAtIndex(index);
      }
    } else if (options.numberOfAccounts) {
      this.addAccounts(options.numberOfAccounts);
    }
  }

  private getPathForIndex(index: number): string {
    return `${this.hdPath}/${index}`;
  }

  private deriveWalletAtIndex(index: number): Wallet {
    const path = this.getPathForIndex(index);
    const childKey = this.hdKey.derive(path);

    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key');
    }

    const wallet = new Wallet(childKey.privateKey);
    const checksumAddress = getAddress(wallet.address);

    const basePublicKey = this.getPathBasePublicKey();
    this.accountDetails[checksumAddress] = {
      hdPath: path,
      hdPathType: this.getHDPathType(),
      hdPathBasePublicKey: basePublicKey,
      index,
    };

    this.wallets.push(wallet);
    return wallet;
  }

  addAccounts(count: number = 1): string[] {
    const newAddresses: string[] = [];
    const startIndex =
      this.activeIndexes.length > 0 ? Math.max(...this.activeIndexes) + 1 : 0;

    for (let i = 0; i < count; i++) {
      const index = startIndex + i;
      this.activeIndexes.push(index);
      const wallet = this.deriveWalletAtIndex(index);
      newAddresses.push(wallet.address);
    }

    return newAddresses;
  }

  async activeAccounts(indexes: number[]): Promise<string[]> {
    const newAddresses: string[] = [];

    for (const index of indexes) {
      if (!this.activeIndexes.includes(index)) {
        this.activeIndexes.push(index);
        const wallet = this.deriveWalletAtIndex(index);
        newAddresses.push(wallet.address);
      }
    }

    return newAddresses;
  }

  getAccounts(): string[] {
    return this.wallets.map(w => w.address);
  }

  getWalletByAddress(address: string): Wallet | undefined {
    return this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );
  }

  getAccountByAddress(
    address: string,
  ): { address: string; privateKey: string } | null {
    const wallet = this.getWalletByAddress(address);
    return wallet
      ? { address: wallet.address, privateKey: wallet.privateKey }
      : null;
  }

  exportAccount(address: string): string {
    const wallet = this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }
    return wallet.privateKey;
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  getInfoByAddress(address: string) {
    const checksumAddress = getAddress(address);
    const detail = this.accountDetails[checksumAddress];

    if (detail) {
      return {
        address: checksumAddress,
        index: detail.index,
        hdPath: detail.hdPath,
        hdPathType: detail.hdPathType,
        hdPathBasePublicKey: detail.hdPathBasePublicKey,
        basePublicKey: detail.hdPathBasePublicKey,
      };
    }

    return undefined;
  }

  async getCurrentAccounts(): Promise<string[]> {
    const currentPublicKey = this.getPathBasePublicKey();

    return this.wallets
      .map(w => w.address)
      .filter(address => {
        const checksumAddress = getAddress(address);
        const detail = this.accountDetails[checksumAddress];
        return detail?.hdPathBasePublicKey === currentPublicKey;
      });
  }

  setHDPathType(hdPathType: HDPathType): void {
    const hdPathMap: Record<HDPathType, string> = {
      BIP44: "m/44'/60'/0'/0",
      Legacy: "m/44'/60'/0'",
      LedgerLive: "m/44'/60'",
    };
    this.hdPath = hdPathMap[hdPathType];
  }

  private getHDPathType(): HDPathType {
    if (this.hdPath === "m/44'/60'/0'/0") return 'BIP44';
    if (this.hdPath === "m/44'/60'/0'") return 'Legacy';
    if (this.hdPath === "m/44'/60'") return 'LedgerLive';
    return 'BIP44';
  }

  private getPathBasePublicKey(): string {
    const baseKey = this.hdKey.derive(this.hdPath);
    if (!baseKey.publicKey) {
      throw new Error('Failed to derive base public key');
    }
    return Buffer.from(baseKey.publicKey).toString('hex');
  }

  serialize(): HDKeyringData {
    return {
      mnemonic: this.mnemonic,
      passphrase: this.passphrase,
      accounts: this.wallets.map(w => w.address),
      activeIndexes: this.activeIndexes,
      hdPath: this.hdPath,
      accountDetails: this.accountDetails,
      byImport: this.byImport,
      index: this.index,
    };
  }

  isValid(): boolean {
    return validateMnemonic(this.mnemonic);
  }

  getAccountCount(): number {
    return this.wallets.length;
  }
}
