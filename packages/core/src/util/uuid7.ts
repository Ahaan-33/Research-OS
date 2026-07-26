// Minimal RFC 9562 UUIDv7 generator: 48-bit ms timestamp + version/variant
// bits + 74 random bits. Per Doc15 D4 ("time-ordered 128-bit random
// identifier, RFC 9562") — implemented locally rather than depending on the
// `uuid` package, whose v10 release ships no bundled type declarations.
import { randomBytes } from 'node:crypto';

export function uuidv7(): string {
  const ts = BigInt(Date.now());
  const rand = randomBytes(10);

  const bytes = Buffer.alloc(16);
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);

  bytes[6] = 0x70 | (rand[0] & 0x0f); // version 7
  bytes[7] = rand[1];
  bytes[8] = 0x80 | (rand[2] & 0x3f); // variant 10
  bytes[9] = rand[3];
  rand.copy(bytes, 10, 4, 10);

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
