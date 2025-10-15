export interface EncryptorAdapter {
  encrypt(password: string, data: string): Promise<string>;
  decrypt(password: string, encryptedData: string): Promise<string>;
}

export interface EncryptedData {
  cipher: string;
  iv: string;
  salt: string;
}
