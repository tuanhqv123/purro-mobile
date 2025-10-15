import { accountService } from '../services/accountService';

export const getAllAccounts = () => accountService.getAllAccounts();

export const addAccountFromHD = (keyringIndex: number, accountIndex: number) =>
  accountService.addAccountFromHD(keyringIndex, accountIndex);

export const addAccountFromPrivateKey = (privateKey: string) =>
  accountService.addAccountFromPrivateKey(privateKey);

export const createNewHDWallet = (mnemonic?: string) =>
  accountService.createNewHDWallet(mnemonic);

export const switchHDPathType = (
  keyringIndex: number,
  hdPathType: 'BIP44' | 'Legacy' | 'LedgerLive',
) => accountService.switchHDPathType(keyringIndex, hdPathType);

export const getAccountsByHDPathType = (
  keyringIndex: number,
  hdPathType: 'BIP44' | 'Legacy' | 'LedgerLive',
) => accountService.getAccountsByHDPathType(keyringIndex, hdPathType);
