import { atom, useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import { apisKeychain } from '@/core/apis';
import {
  KEYCHAIN_AUTH_TYPES,
  isAuthenticatedByBiometrics,
} from '@/core/services/keychain';

// Biometrics state atom
const biometricsInfoAtom = atom({
  authEnabled: isAuthenticatedByBiometrics(),
  supportedBiometryType: null as BIOMETRY_TYPE | null,
});

// Initialize biometrics on mount
biometricsInfoAtom.onMount = setter => {
  apisKeychain
    .getSupportedBiometryType()
    .then((supportedType: BIOMETRY_TYPE | null) => {
      setter(prev => ({ ...prev, supportedBiometryType: supportedType }));
    });
};

export function useBiometricsComputed() {
  const biometrics = useAtomValue(biometricsInfoAtom);

  const computed = useMemo(() => {
    const { authEnabled, supportedBiometryType } = biometrics;

    const isFaceID = supportedBiometryType === BIOMETRY_TYPE.FACE_ID;
    const isTouchID = supportedBiometryType === BIOMETRY_TYPE.TOUCH_ID;
    const isFingerprint = supportedBiometryType === BIOMETRY_TYPE.FINGERPRINT;

    return {
      isBiometricsEnabled: authEnabled && !!supportedBiometryType,
      settingsAuthEnabled: authEnabled,
      couldSetupBiometrics: !!supportedBiometryType,
      supportedBiometryType,
      defaultTypeLabel: isFaceID
        ? 'Face ID'
        : isTouchID
        ? 'Touch ID'
        : isFingerprint
        ? 'Fingerprint'
        : 'Biometric',
      isFaceID,
    };
  }, [biometrics]);

  return computed;
}

export function useBiometrics(_options?: { autoFetch?: boolean }) {
  const [biometrics, setBiometrics] = useAtom(biometricsInfoAtom);

  const fetchBiometrics = useCallback(async () => {
    try {
      let supportedType = null as null | BIOMETRY_TYPE;
      try {
        supportedType = await apisKeychain.getSupportedBiometryType();
      } catch (error) {
        console.error('❌ Error getting supported biometry type:', error);
      }

      const authEnabled = supportedType ? isAuthenticatedByBiometrics() : false;

      setBiometrics(prev => ({
        ...prev,
        supportedBiometryType: supportedType,
        authEnabled: authEnabled,
      }));
    } catch (error) {
      console.error('❌ fetchBiometrics error:', error);
    }
  }, [setBiometrics]);

  const toggleBiometrics = useCallback(
    async <T extends boolean>(
      nextEnabled: T,
      input: { tipLoading?: boolean } & (T extends true
        ? { validatedPassword: string }
        : { validatedPassword?: undefined }),
    ) => {
      const { validatedPassword } = input;

      try {
        if (nextEnabled && validatedPassword) {
          // Enable biometrics
          await apisKeychain.setGenericPassword(
            validatedPassword,
            KEYCHAIN_AUTH_TYPES.BIOMETRICS,
          );
          setBiometrics(prev => ({ ...prev, authEnabled: true }));
        } else {
          // Disable biometrics
          await apisKeychain.resetGenericPassword();
          setBiometrics(prev => ({ ...prev, authEnabled: false }));
        }
      } catch (error) {
        console.error('Toggle biometrics error:', error);
        throw error;
      }
    },
    [setBiometrics],
  );

  const computed = useBiometricsComputed();

  return {
    biometrics,
    computed,
    toggleBiometrics,
    fetchBiometrics,
  };
}

export function useVerifyByBiometrics() {
  const { computed } = useBiometrics();

  const verifyByBiometrics = useCallback(async () => {
    if (!computed.isBiometricsEnabled) {
      throw new Error('Biometrics not enabled');
    }

    try {
      const result = await apisKeychain.requestGenericPassword();
      return result;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      throw error;
    }
  }, [computed.isBiometricsEnabled]);

  return {
    verifyByBiometrics,
    isBiometricsAvailable: computed.isBiometricsEnabled,
  };
}
