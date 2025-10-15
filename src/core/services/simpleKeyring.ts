import { Wallet } from 'ethers';

export interface SimpleKeyringData {
  privateKeys: string[];
}

export interface SimpleKeyringAccount {
  address: string;
  privateKey: string;
}

export class SimpleKeyring {
  private wallets: Wallet[] = [];

  constructor(data?: SimpleKeyringData) {
    if (data?.privateKeys) {
      this.wallets = data.privateKeys.map(pk => new Wallet(pk));
    }
  }

  static validatePrivateKey(privateKey: string): boolean {
    try {
      let keyWithPrefix = privateKey.trim();
      if (!keyWithPrefix.startsWith('0x')) {
        keyWithPrefix = '0x' + keyWithPrefix;
      }

      if (!/^0x[0-9a-fA-F]{64}$/.test(keyWithPrefix)) {
        return false;
      }

      const wallet = new Wallet(keyWithPrefix);
      return !!wallet.address;
    } catch {
      return false;
    }
  }

  addAccount(privateKey: string): string {
    let keyWithPrefix = privateKey.trim();
    if (!keyWithPrefix.startsWith('0x')) {
      keyWithPrefix = '0x' + keyWithPrefix;
    }

    if (!SimpleKeyring.validatePrivateKey(keyWithPrefix)) {
      throw new Error('Invalid private key');
    }

    const wallet = new Wallet(keyWithPrefix);
    const address = wallet.address;

    const isDuplicate = this.wallets.some(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (isDuplicate) {
      throw new Error('This wallet has already been imported');
    }

    this.wallets.push(wallet);
    return address;
  }

  getAccounts(): string[] {
    return this.wallets.map(w => w.address);
  }

  getAccountByAddress(address: string): SimpleKeyringAccount | null {
    const wallet = this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      return null;
    }

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  exportAccount(address: string): string {
    const wallet = this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      throw new Error('Account not found');
    }

    return wallet.privateKey;
  }

  async signTransaction(address: string, txData: any): Promise<string> {
    const wallet = this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      throw new Error('Account not found');
    }

    return await wallet.signTransaction(txData);
  }

  async signMessage(address: string, message: string): Promise<string> {
    const wallet = this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      throw new Error('Account not found');
    }

    return await wallet.signMessage(message);
  }

  serialize(): SimpleKeyringData {
    return {
      privateKeys: this.wallets.map(w => w.privateKey),
    };
  }

  removeAccount(address: string): void {
    const index = this.wallets.findIndex(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (index === -1) {
      throw new Error('Account not found');
    }

    this.wallets.splice(index, 1);
  }
}
