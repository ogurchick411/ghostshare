import { bufferToBase64, base64ToBuffer } from '../utils/encoding.js';

export async function encryptMessage(text, key) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text payload must be a non-empty string');
  }
  if (!key) {
    throw new Error('CryptoKey is required for encryption');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer)
  };
}

export async function decryptMessage(encryptedObj, key) {
  if (!encryptedObj || !encryptedObj.ciphertext || !encryptedObj.iv) {
    throw new Error('Invalid encrypted payload structure');
  }
  if (!key) {
    throw new Error('CryptoKey is required for decryption');
  }

  const ciphertext = base64ToBuffer(encryptedObj.ciphertext);
  const iv = base64ToBuffer(encryptedObj.iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv)
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}