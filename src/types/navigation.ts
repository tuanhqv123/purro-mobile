import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Onboarding flow
  Welcome: undefined;
  SeedPhraseDisplay: { mnemonic: string };
  SeedPhraseVerify: { mnemonic: string };
  CreatePassword: {
    mnemonic: string;
    isImport?: boolean;
  };
  WalletSuccess: undefined;

  // Import flow
  ImportMethods: undefined;
  ImportSeedPhrase: undefined;
  ImportPrivateKey: undefined;
  ImportSuccess: {
    type: 'seedPhrase' | 'privateKey';
    address: string;
  };

  // Export flow
  ExportPassword: undefined;
  ExportSeedPhrase: { mnemonic: string };

  // Auth flow
  Unlock: undefined;

  // Main app flow
  Home: undefined;
  Settings: undefined;
};

// Screen props types
export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

export type SeedPhraseDisplayScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SeedPhraseDisplay'
>;

export type SeedPhraseVerifyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SeedPhraseVerify'
>;

export type CreatePasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreatePassword'
>;

export type UnlockScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Unlock'
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

export type WalletSuccessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WalletSuccess'
>;

export type ImportMethodsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImportMethods'
>;

export type ImportSeedPhraseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImportSeedPhrase'
>;

export type ImportPrivateKeyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImportPrivateKey'
>;

export type ImportSuccessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImportSuccess'
>;

export type ExportPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExportPassword'
>;

export type ExportSeedPhraseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExportSeedPhrase'
>;
