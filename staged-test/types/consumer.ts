// Type checks image-hash's published declarations from a TypeScript ESM project
import { Buffer } from 'node:buffer';
import { imageHash, type BufferObject, type UrlRequestObject } from 'image-hash';

const fromPath: Promise<string> = imageHash('photo.jpg');
const withOptions: Promise<string> = imageHash('photo.jpg', 8, false);

const buffer: BufferObject = { data: Buffer.from([]), ext: 'image/png', name: 'photo.png' };
const request: UrlRequestObject = {
  url: 'https://example.com/photo.jpg',
  headers: { authorization: 'Bearer token' },
  signal: AbortSignal.timeout(10_000),
};

export const hashes: Promise<string>[] = [
  fromPath,
  withOptions,
  imageHash(buffer),
  imageHash(request),
  imageHash(Buffer.from([])),
];

// @ts-expect-error the callback argument was removed in v8
void imageHash('photo.jpg', 16, true, () => undefined);
