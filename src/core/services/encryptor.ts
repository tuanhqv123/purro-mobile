import Aes from 'react-native-aes-crypto';
import { EncryptorAdapter, EncryptedData } from '@/types/encryptor';

const algorithms = 'aes-256-cbc';
const algorithms_pbkdf2 = 'sha256';

async function _generateSalt(byteCount = 32) {
  const saltStr = await Aes.randomKey(byteCount);
  return btoa(saltStr);
}

async function _generateKey(password: string, salt: string) {
  return Aes.pbkdf2(password, salt, 5000, 256, algorithms_pbkdf2);
}

async function _keyFromPassword(password: string, salt: string) {
  return _generateKey(password, salt);
}

async function _encryptWithKey(text: string, keyBase64: string) {
  const iv = await Aes.randomKey(16);
  return Aes.encrypt(text, keyBase64, iv, algorithms).then(
    (cipher: string) => ({
      cipher,
      iv,
      salt: '',
    }),
  );
}

async function _decryptWithKey(encryptedData: EncryptedData, key: string) {
  return Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, algorithms);
}

export class Encryptor implements EncryptorAdapter {
  key = null;

  async encrypt(password: string, object: unknown): Promise<string> {
    try {
      const salt = await _generateSalt(16);
      const key = await _keyFromPassword(password, salt);
      const result = await _encryptWithKey(JSON.stringify(object), key);
      result.salt = salt;

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(password: string, encryptedString: string): Promise<any> {
    try {
      const encryptedData = JSON.parse(encryptedString);
      const key = await _keyFromPassword(password, encryptedData.salt);
      const data = await _decryptWithKey(encryptedData, key);
      const result = JSON.parse(data);
      return result;
    } catch (error) {
      throw new Error(
        'Failed to decrypt data - invalid password or corrupted data',
      );
    }
  }

  async decryptWithLogging(
    password: string,
    encryptedString: string,
  ): Promise<any> {
    try {
      const encryptedData = JSON.parse(encryptedString);
      const key = await _keyFromPassword(password, encryptedData.salt);
      const data = await _decryptWithKey(encryptedData, key);
      const result = JSON.parse(data);
      return result;
    } catch (error) {
      throw new Error(
        'Failed to decrypt data - invalid password or corrupted data',
      );
    }
  }
}

// Export singleton instance
export const appEncryptor = new Encryptor();
