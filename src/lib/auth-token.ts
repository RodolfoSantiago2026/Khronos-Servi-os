/**
 * Cryptographic token signing and verification using Web Crypto API.
 * This runs on both Node.js and Next.js Edge Runtime (Middleware).
 */

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Generates a signed token: payloadBase64.signatureBase64
 */
export async function generateToken(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  
  // Safe base64 encoding for unicode strings
  const payloadBase64 = btoa(encodeURIComponent(payloadStr));
  
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadBase64)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = btoa(String.fromCharCode.apply(null, signatureArray));
  
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies a signed token and returns the payload if valid, otherwise null.
 */
export async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [payloadBase64, signatureBase64] = parts;
    const key = await getCryptoKey(secret);
    const encoder = new TextEncoder();
    
    const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadBase64)
    );
    
    if (!isValid) return null;
    
    const payloadStr = decodeURIComponent(atob(payloadBase64));
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
