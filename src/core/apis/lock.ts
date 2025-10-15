import { keyringService, lockService } from '../services';
import { makeEEClass } from './event';
import { formatTimeReadable } from '@/utils/time';
import {
  resetMultipleFailed,
  checkMultipleFailed,
  shouldRejectUnlockDueToMultipleFailed,
} from '../utils/unlockRateLimit';

export type UIAuthType = 'none' | 'password' | 'biometrics';
export type ValidationBehaviorOnFinishedContext = {
  hasSetupCustomPassword?: boolean;
  authType?: UIAuthType;
  getValidatedPassword: () => string;
};
export type ValidationBehaviorProps = {
  validationHandler?(password: string): void | Promise<void>;
  onFinished?(ctx: ValidationBehaviorOnFinishedContext): void;
};

const DefaultValidationPassword: ValidationBehaviorProps['validationHandler'] &
  object = throwErrorIfInvalidPwd;
const noop = () => {};

export function parseValidationBehavior(props?: ValidationBehaviorProps) {
  const { validationHandler, onFinished } = props || {};
  return {
    validationHandler: validationHandler || DefaultValidationPassword,
    onFinished: onFinished || noop.bind(null),
  };
}

function validatePassword(password: string): string {
  if (!password || password.trim().length === 0) {
    return 'Password cannot be empty';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return '';
}

/* ===================== Password:start ===================== */
async function safeVerifyPassword(password: string) {
  const result = { success: false, error: null as null | Error };
  try {
    await keyringService.verifyPassword(password);
    result.success = true;
  } catch (error: any) {
    result.success = false;
    result.error = error?.message;
  }

  return result;
}

const ERRORS = {
  INCORRECT_PASSWORD: 'Incorrect password',
  CURRENT_IS_INCORRET: 'Current password is incorrect',
};

export async function throwErrorIfInvalidPwd(password: string) {
  try {
    await keyringService.verifyPassword(password);
  } catch (error) {
    throw new Error(ERRORS.INCORRECT_PASSWORD);
  }
}

export async function setupWalletPassword(newPassword: string) {
  const validationError = validatePassword(newPassword);
  if (validationError) {
    return { error: validationError };
  }

  try {
    await keyringService.setPassword(newPassword);
    return { error: '' };
  } catch (error: any) {
    return { error: error?.message || 'Failed to set password' };
  }
}

export async function shouldAskSetPassword() {
  return !keyringService.hasPassword();
}

export async function updateWalletPassword(
  oldPassword: string,
  newPassword: string,
) {
  const validationError = validatePassword(newPassword);
  if (validationError) {
    return { error: validationError };
  }

  try {
    await keyringService.verifyPassword(oldPassword);
  } catch (error) {
    return { error: ERRORS.INCORRECT_PASSWORD };
  }

  try {
    await keyringService.updatePassword(oldPassword, newPassword);
    return { error: '' };
  } catch (error: any) {
    return { error: error?.message || 'Failed to update password' };
  }
}

export async function resetWalletAndPassword(newPassword: string) {
  const validationError = validatePassword(newPassword);
  if (validationError) {
    return { error: validationError };
  }

  try {
    await keyringService.resetPassword(newPassword);
    return { error: '' };
  } catch (error: any) {
    return { error: error?.message || 'Failed to reset password' };
  }
}

/* ===================== Password:end ===================== */

export async function getLockInfo() {
  return {
    hasPassword: keyringService.hasPassword(),
    isUnlocked: keyringService.isUnlocked(),
  };
}

export function isUnlocked() {
  return keyringService.isUnlocked();
}

export type UnlockResult = {
  success: boolean;
  error: string;
  formFieldError?: string;
  toastError?: string;
};

export async function unlockWallet(password: string): Promise<UnlockResult> {
  const unlockResult: UnlockResult = {
    success: false,
    error: '',
    formFieldError: '',
    toastError: '',
  };

  // Check rate limiting
  const checkReject = shouldRejectUnlockDueToMultipleFailed();
  if (checkReject.reject) {
    unlockResult.error = ERRORS.INCORRECT_PASSWORD;
    unlockResult.formFieldError = 'Too many failed attempts';
    unlockResult.toastError = `Too many failed attempts, please try again after ${formatTimeReadable(
      Math.floor(checkReject.timeDiff / 1e3),
    )}`;
    return unlockResult;
  }

  try {
    // Boot keyring service if not booted
    if (!keyringService.isBooted()) {
      await keyringService.boot(password);
    }

    // Verify password
    await keyringService.verifyPassword(password);
    resetMultipleFailed();

    // Submit password to unlock
    await keyringService.submitPassword(password);
    // sessionService.setUnlocked(true); // TODO: Implement session service if needed

    unlockResult.success = true;
  } catch (err) {
    unlockResult.error = ERRORS.INCORRECT_PASSWORD;
    unlockResult.formFieldError = 'Incorrect password';
    checkMultipleFailed();
  }

  return unlockResult;
}

export async function verifyPassword(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await keyringService.verifyPassword(password);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid password' };
  }
}

export async function lockWallet() {
  keyringService.lock();
  // sessionService.setUnlocked(false); // TODO: Implement session service if needed
}

const { EventEmitter: UnlockTimeEvent } = makeEEClass<{
  updated: (time: number) => void;
}>();
export const unlockTimeEvent = new UnlockTimeEvent();

const unlockTimeRef = {
  current: 0,
};

export function getUnlockTime() {
  return unlockTimeRef.current;
}

export async function updateUnlockTime() {
  const time = Date.now();
  unlockTimeRef.current = time;
  unlockTimeEvent.emit('updated', time);
}

function makeLockApiWithUpdateUnlockTime<T extends (...args: any[]) => any>(
  fn: T,
): T {
  return function (...args) {
    const res = fn(...args);
    updateUnlockTime();
    return res;
  } as T;
}

export const unlockWalletWithUpdateUnlockTime =
  makeLockApiWithUpdateUnlockTime(unlockWallet);
export const safeVerifyPasswordAndUpdateUnlockTime =
  makeLockApiWithUpdateUnlockTime(safeVerifyPassword);

export function subscribeAppLock(_fn: () => void) {
  const dispose = () => {
    // No-op
  };
  return dispose;
}

export const apisLock = {
  setupWalletPassword,
  updateWalletPassword,
  resetWalletAndPassword,
  getLockInfo,
  isUnlocked,
  unlockWallet,
  verifyPassword,
  lockWallet,
  getUnlockTime,
  updateUnlockTime,
  markAsUnlocked: () => lockService.markAsUnlocked(),
  unlockWalletWithUpdateUnlockTime,
  safeVerifyPasswordAndUpdateUnlockTime,
  subscribeAppLock,
  shouldAskSetPassword,
};
