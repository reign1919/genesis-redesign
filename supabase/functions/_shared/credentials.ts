const PASSWORD_UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const PASSWORD_LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const PASSWORD_DIGITS = '23456789';
const PASSWORD_SYMBOLS = '!@#$%';
const PASSWORD_ALPHABET =
  `${PASSWORD_UPPERCASE}${PASSWORD_LOWERCASE}${PASSWORD_DIGITS}${PASSWORD_SYMBOLS}`;
const PASSWORD_LENGTH = 16;

function bytesToBase64(bytes: Uint8Array): string {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function base64ToBytes(value: string): Uint8Array {
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

function randomCharacter(alphabet: string): string {
  const limit = 256 - (256 % alphabet.length);
  while (true) {
    const byte = crypto.getRandomValues(new Uint8Array(1))[0];
    if (byte < limit) return alphabet[byte % alphabet.length];
  }
}

export function generateSchoolPassword(): string {
  const characters = [
    randomCharacter(PASSWORD_UPPERCASE),
    randomCharacter(PASSWORD_LOWERCASE),
    randomCharacter(PASSWORD_DIGITS),
    randomCharacter(PASSWORD_SYMBOLS),
  ];
  while (characters.length < PASSWORD_LENGTH) characters.push(randomCharacter(PASSWORD_ALPHABET));

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [characters[index], characters[randomIndex]] = [characters[randomIndex], characters[index]];
  }
  return characters.join('');
}

async function importEncryptionKey(encodedKey: string): Promise<CryptoKey> {
  const keyBytes = base64ToBytes(encodedKey);
  if (keyBytes.byteLength !== 32) throw new Error('invalid credential encryption key');
  return await crypto.subtle.importKey('raw', asArrayBuffer(keyBytes), 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptPassword(
  password: string,
  encodedKey: string,
): Promise<{ ciphertext: string; iv: string }> {
  const key = await importEncryptionKey(encodedKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(password),
  );
  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
  };
}

export async function decryptPassword(
  ciphertext: string,
  encodedIv: string,
  encodedKey: string,
): Promise<string> {
  const key = await importEncryptionKey(encodedKey);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: asArrayBuffer(base64ToBytes(encodedIv)) },
    key,
    asArrayBuffer(base64ToBytes(ciphertext)),
  );
  return new TextDecoder().decode(plaintext);
}

export function schoolAuthEmail(schoolCode: string, domain: string): string {
  if (!/^GEN-[0-9]{4}$/u.test(schoolCode) || !/^[a-z0-9.-]+$/u.test(domain)) {
    throw new Error('invalid school auth alias');
  }
  return `${schoolCode.toLowerCase()}@${domain}`;
}
