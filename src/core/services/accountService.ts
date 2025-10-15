import { keyringService } from './keyring';

export interface AccountInfo {
  address: string;
  type: string;
  brandName: string;
  aliasName?: string;
  balance?: number;
  hdPath?: string;
  hdPathType?: 'BIP44' | 'Legacy' | 'LedgerLive';
  hdPathBasePublicKey?: string;
  index?: number;
  keyringIndex?: number;
}

class AccountService {
  async getAllAccounts(): Promise<AccountInfo[]> {
    const accounts: AccountInfo[] = [];

    const hdKeyrings = keyringService.getHDKeyrings();
    for (const keyring of hdKeyrings) {
      const serialized = keyring.serialize();
      const keyringAccounts = keyring.getAccounts();

      for (const address of keyringAccounts) {
        const info = keyring.getInfoByAddress(address);

        accounts.push({
          address,
          type: 'HD Key Tree',
          brandName: 'HD Key Tree',
          hdPath: info?.hdPath,
          hdPathType: info?.hdPathType,
          hdPathBasePublicKey: info?.hdPathBasePublicKey,
          index: info?.index,
          keyringIndex: serialized.index,
        });
      }
    }

    const simpleKeyrings = keyringService.getSimpleKeyrings();
    for (const keyring of simpleKeyrings) {
      const keyringAccounts = keyring.getAccounts();

      for (const address of keyringAccounts) {
        accounts.push({
          address,
          type: 'Simple Key Pair',
          brandName: 'Private Key',
        });
      }
    }

    return accounts;
  }

  async addAccountFromHD(
    keyringIndex: number,
    accountIndex: number,
  ): Promise<string> {
    const keyring = keyringService.getHDKeyringByIndex(keyringIndex);
    if (!keyring) {
      throw new Error(`HD keyring not found with index ${keyringIndex}`);
    }

    const newAccounts = await keyring.activeAccounts([accountIndex]);
    if (newAccounts.length === 0) {
      throw new Error('Failed to activate account');
    }

    const password = keyringService.getPassword();
    if (!password) {
      throw new Error('Wallet is locked');
    }

    await keyringService.persistAllKeyrings(password);

    return newAccounts[0];
  }

  async addAccountFromPrivateKey(privateKey: string): Promise<string> {
    const addresses = await keyringService.createSimpleKeyring(privateKey);
    const password = keyringService.getPassword();
    
    if (!password) {
      throw new Error('Wallet is locked');
    }

    await keyringService.persistAllKeyrings(password);
    return addresses[0];
  }

  async createNewHDWallet(
    mnemonic?: string,
  ): Promise<{ addresses: string[]; keyringIndex: number }> {
    const generatedMnemonic = mnemonic || keyringService.generateMnemonic();
    const addresses = await keyringService.createHDKeyring(generatedMnemonic);

    const hdKeyrings = keyringService.getHDKeyrings();
    const newKeyring = hdKeyrings[hdKeyrings.length - 1];
    const serialized = newKeyring.serialize();

    const password = keyringService.getPassword();
    if (!password) {
      throw new Error('Wallet is locked');
    }

    await keyringService.persistAllKeyrings(password);

    return {
      addresses,
      keyringIndex: serialized.index,
    };
  }

  async switchHDPathType(
    keyringIndex: number,
    hdPathType: 'BIP44' | 'Legacy' | 'LedgerLive',
  ): Promise<void> {
    const keyring = keyringService.getHDKeyringByIndex(keyringIndex);
    if (!keyring) {
      throw new Error(`HD keyring not found with index ${keyringIndex}`);
    }

    keyring.setHDPathType(hdPathType);

    const password = keyringService.getPassword();
    if (!password) {
      throw new Error('Wallet is locked');
    }

    await keyringService.persistAllKeyrings(password);
  }

  async getAccountsByHDPathType(
    keyringIndex: number,
    hdPathType: 'BIP44' | 'Legacy' | 'LedgerLive',
  ): Promise<string[]> {
    const keyring = keyringService.getHDKeyringByIndex(keyringIndex);
    if (!keyring) {
      throw new Error(`HD keyring not found with index ${keyringIndex}`);
    }

    const originalSerialized = keyring.serialize();
    const originalPath = originalSerialized.hdPath;

    keyring.setHDPathType(hdPathType);
    const accounts = await keyring.getCurrentAccounts();

    const hdPathMap: Record<string, 'BIP44' | 'Legacy' | 'LedgerLive'> = {
      "m/44'/60'/0'/0": 'BIP44',
      "m/44'/60'/0'": 'Legacy',
      "m/44'/60'": 'LedgerLive',
    };

    const originalType =
      (hdPathMap[originalPath] as 'BIP44' | 'Legacy' | 'LedgerLive') || 'BIP44';
    keyring.setHDPathType(originalType);

    return accounts;
  }
}

export const accountService = new AccountService();
