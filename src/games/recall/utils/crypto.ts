/**
 * Client-side cryptographic helper to encrypt/decrypt personal API keys
 * stored in the browser's localStorage using AES-GCM with PBKDF2 key derivation.
 */

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export interface EncryptedKeyPayload {
  version: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

/**
 * Encrypts a plaintext string (e.g. Gemini API Key) with a user-chosen passphrase.
 */
export async function encryptApiKeyLocally(
  plaintext: string,
  passphrase: string
): Promise<string> {
  if (!plaintext || !passphrase) {
    throw new Error('Plaintext and passphrase are required');
  }

  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  const payload: EncryptedKeyPayload = {
    version: 1,
    salt: arrayBufferToHex(salt.buffer),
    iv: arrayBufferToHex(iv.buffer),
    ciphertext: arrayBufferToHex(ciphertextBuffer),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts an encrypted payload with the user's passphrase.
 * Returns the plaintext API key if successful, or null if the passphrase was wrong.
 */
export async function decryptApiKeyLocally(
  payloadStr: string,
  passphrase: string
): Promise<string | null> {
  if (!payloadStr || !passphrase) return null;

  try {
    const payload: EncryptedKeyPayload = JSON.parse(payloadStr);
    if (!payload.salt || !payload.iv || !payload.ciphertext) {
      return null;
    }

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const salt = hexToArrayBuffer(payload.salt);
    const iv = hexToArrayBuffer(payload.iv);
    const ciphertext = hexToArrayBuffer(payload.ciphertext);

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      ciphertext
    );

    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.warn('Decryption failed (likely incorrect passphrase):', err);
    return null;
  }
}
