// src/lib/crypto.ts
// Utility for encrypting and decrypting sensitive data using Web Crypto API (AES-GCM)
// Compatible with Node.js, Next.js Edge, and Cloudflare Workers

/**
 * Derives a 256-bit (32-byte) AES-GCM key from a given secret string using SHA-256.
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = enc.encode(secret);
  
  // Hash the secret to ensure it's exactly 256 bits (32 bytes)
  const hash = await crypto.subtle.digest("SHA-256", keyMaterial);
  
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Converts a Uint8Array to a hex string.
 */
export function buf2hex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * Converts a hex string to a Uint8Array.
 */
export function hex2buf(hexString: string): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Encrypts a plaintext string using AES-GCM and the provided secret.
 * Returns a string in the format "iv_hex:ciphertext_hex"
 */
export async function encryptSymmetric(text: string, secret: string): Promise<string> {
  if (!text) return "";
  
  const key = await deriveKey(secret);
  const enc = new TextEncoder();
  const encoded = enc.encode(text);

  // Generate 12 bytes (96 bits) IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  return `${buf2hex(iv.buffer)}:${buf2hex(ciphertext)}`;
}

/**
 * Decrypts a ciphertext string (format "iv_hex:ciphertext_hex") using AES-GCM and the provided secret.
 * Returns the decrypted plaintext string.
 */
export async function decryptSymmetric(encrypted: string, secret: string): Promise<string> {
  if (!encrypted || !encrypted.includes(":")) return encrypted; // fallback for unencrypted

  try {
    const parts = encrypted.split(":");
    if (parts.length !== 2) return encrypted;

    const iv = hex2buf(parts[0]);
    const ciphertext = hex2buf(parts[1]);

    const key = await deriveKey(secret);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed", err);
    return ""; // return empty on failure for safety
  }
}
