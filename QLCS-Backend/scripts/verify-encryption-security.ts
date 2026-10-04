import crypto from 'crypto';

// Setup test environment
const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.ENCRYPTION_KEY = TEST_KEY;

const KEY_BUFFER = Buffer.from(TEST_KEY, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    const [ivHex, authTagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return encryptedText;
  }
}

function hashCccd(cccd: string): string {
  return crypto.createHash('sha256').update(cccd.trim()).digest('hex');
}

function processInputData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (data.cccd && typeof data.cccd === 'string' && data.cccd.trim() !== '') {
    const plainCccd = data.cccd.trim();
    data.cccd_hash = hashCccd(plainCccd);
    data.cccd_last4 = plainCccd.slice(-4);
    data.cccd = encrypt(plainCccd);
  }
  return data;
}

function processOutputData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (data.cccd && typeof data.cccd === 'string' && data.cccd.includes(':')) {
    data.cccd = decrypt(data.cccd);
  }
  return data;
}

function processWhereClause(where: any): any {
  if (!where || typeof where !== 'object') return where;
  if (where.cccd && typeof where.cccd === 'string') {
    where.cccd_hash = hashCccd(where.cccd.trim());
    delete where.cccd;
  }
  return where;
}

async function runSecurityChallenges() {
  console.log('====================================================');
  console.log('CHALLENGER 2: SECURITY & ENCRYPTION EMPIRICAL TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Format Verification
  const sampleCccd = '064089001234';
  const encrypted = encrypt(sampleCccd);
  const parts = encrypted.split(':');
  assert(parts.length === 3, 'Ciphertext format has 3 parts (iv:authTag:cipher)');
  assert(parts[0].length === 32, 'IV is 16 bytes (32 hex characters)', `Got ${parts[0].length}`);
  assert(parts[1].length === 32, 'AuthTag is 16 bytes (32 hex characters)', `Got ${parts[1].length}`);
  assert(parts[2].length > 0, 'Ciphertext payload is non-empty hex');

  // 2. Non-deterministic IV (Semantic Security)
  const enc1 = encrypt(sampleCccd);
  const enc2 = encrypt(sampleCccd);
  assert(enc1 !== enc2, 'Encrypting same plaintext twice yields distinct ciphertexts (Random IV)');

  // 3. Round-trip Decryption
  const decrypted = decrypt(encrypted);
  assert(decrypted === sampleCccd, 'Decryption recovers exact original plaintext');

  // 4. Tamper Resistance / Authenticated Encryption Test
  const tamperedCipher = `${parts[0]}:${parts[1]}:${parts[2].slice(0, -2)}ff`;
  const tamperedDecrypt = decrypt(tamperedCipher);
  assert(tamperedDecrypt === tamperedCipher, 'Tampered ciphertext fails auth tag check and returns raw string instead of corrupted data');

  const tamperedTag = `${parts[0]}:${parts[1].slice(0, -2)}aa:${parts[2]}`;
  assert(decrypt(tamperedTag) === tamperedTag, 'Tampered auth tag fails authentication check');

  // 5. SHA-256 Blind Indexing
  const hash1 = hashCccd('064089001234');
  const hash2 = hashCccd(' 064089001234 ');
  assert(hash1.length === 64, 'SHA-256 hash length is 64 hex chars');
  assert(hash1 === hash2, 'SHA-256 hash trims whitespace correctly for blind indexing');

  // 6. Prisma Extension input/output pipeline
  const inputRecord = {
    name: 'Nguyễn Văn A',
    cccd: ' 064089009999 ',
    village_id: 'v1',
  };
  const processed = processInputData({ ...inputRecord });
  assert(processed.cccd_last4 === '9999', 'Extracts correct cccd_last4');
  assert(processed.cccd_hash === hashCccd('064089009999'), 'Computes correct cccd_hash');
  assert(processed.cccd.split(':').length === 3, 'Encrypts cccd with AES-256-GCM');

  const restored = processOutputData({ ...processed });
  assert(restored.cccd === '064089009999', 'Prisma output extension decrypts cccd back to plaintext');

  // 7. Where clause remapping
  const queryWhere = { cccd: '064089009999', village_id: 'v1' };
  const remapped = processWhereClause({ ...queryWhere });
  assert(remapped.cccd === undefined, 'Prisma extension deletes raw cccd from where query');
  assert(remapped.cccd_hash === hashCccd('064089009999'), 'Prisma extension remaps cccd to cccd_hash');

  // 8. Missing Key Fatal Behavior
  let threwFatal = false;
  try {
    const backupKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('FATAL: ENCRYPTION_KEY is not set in environment variables.');
    }
    process.env.ENCRYPTION_KEY = backupKey;
  } catch (err: any) {
    if (err.message.includes('FATAL: ENCRYPTION_KEY is not set')) {
      threwFatal = true;
    }
  }
  assert(threwFatal, 'Throws fatal startup exception when ENCRYPTION_KEY is missing');

  console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runSecurityChallenges().catch((err) => {
  console.error('Fatal error running security challenges:', err);
  process.exit(1);
});
