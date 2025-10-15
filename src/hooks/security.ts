import { useEffect } from 'react';
import { Platform } from 'react-native';

export type ProtectedScreenType = 'SeedPhrase' | 'CreateWallet' | 'Password';

export function useProtectedScreen(screenType: ProtectedScreenType) {
  useEffect(() => {
    // Show warning about screenshot prevention
    if (screenType === 'SeedPhrase') {
      // Screenshot protection active - seed phrase screen
    }

    // Note: Real screenshot prevention requires native modules
    // For now, we rely on PrivacyBlur when app goes to background
    // and warn users about security
  }, [screenType]);
}

export function useAppPreventScreenshotOnScreen(options: { isTop?: boolean }) {
  useEffect(() => {
    if (!options.isTop) {
      console.warn('useAppPreventScreenshotOnScreen is not on top');
      return;
    }
  }, [options.isTop]);
}

export function useScreenshotDetection(onScreenshot?: () => void): void {
  useEffect(() => {
    // iOS screenshot detection would require native module
    // For now, show warning when screen is sensitive
  }, [onScreenshot]);
}

export function useIOSScreenRecording(options?: {
  isTop?: boolean;
  onIsBeingCapturedChanged?: (isBeingCaptured: boolean) => void;
}) {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!options?.isTop) return;

    // iOS screen recording detection requires native module
  }, [options]);
}
