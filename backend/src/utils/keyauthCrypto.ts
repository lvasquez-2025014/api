import crypto from 'crypto';

// Matches KeyAuth C++ SDK encryption: AES-256-CBC
// Key = sha256(encKey).substr(0, 32) as raw bytes
// IV  = sha256(initIv).substr(0, 16) as raw bytes
// Output: lowercase hex-encoded ciphertext

export function keyauthEncrypt(plainText: string, encKey: string, initIv: string): string {
  const aesKey = crypto.createHash('sha256').update(encKey, 'utf8').digest('hex').substring(0, 32);
  const aesIv = crypto.createHash('sha256').update(initIv, 'utf8').digest('hex').substring(0, 16);

  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, aesIv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function keyauthDecrypt(cipherHex: string, encKey: string, initIv: string): string {
  const aesKey = crypto.createHash('sha256').update(encKey, 'utf8').digest('hex').substring(0, 32);
  const aesIv = crypto.createHash('sha256').update(initIv, 'utf8').digest('hex').substring(0, 16);

  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, aesIv);
  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Hex encode/decode matching C++ SDK: encryption::encode / encryption::decode
export function hexEncode(text: string): string {
  return Buffer.from(text, 'utf8').toString('hex');
}

export function hexDecode(hex: string): string {
  return Buffer.from(hex, 'hex').toString('utf8');
}

// Parse form-encoded POST body into key-value map
export function parseFormBody(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  const pairs = body.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value !== undefined) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
}

// Build a response JSON matching KeyAuth protocol, encrypted with the given key/iv
export function buildResponse(data: Record<string, any>, encKey: string, initIv: string): string {
  const json = JSON.stringify(data);
  return keyauthEncrypt(json, encKey, initIv);
}
