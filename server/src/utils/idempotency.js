import crypto from 'crypto';

export function generateIdempotencyKey() {
  return crypto.randomBytes(16).toString('hex');
}

export function isValidIdempotencyKey(key) {
  return typeof key === 'string' && key.trim().length >= 8;
}

