import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import webp from '@cwasm/webp';
import { fileTypeFromBuffer } from 'file-type';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import blockhash from './block-hash.js';
import type { ImageData } from './block-hash.js';

export interface UrlRequestObject extends RequestInit {
  url: string;
  /** @deprecated Ignored. Kept for backwards compatibility. */
  encoding?: string | null;
}

export interface BufferObject {
  /** Mime type of the image, e.g. `image/jpeg`. Detected from the data if omitted. */
  ext?: string;
  data: Buffer;
  /** File name, used to check the file extension matches the mime type. */
  name?: string;
}

export type ImageSource = string | Buffer | UrlRequestObject | BufferObject;

interface LoadedImage {
  data: Buffer;
  name?: string;
  mime?: string;
}

interface Decoder {
  extensions: string[];
  decode: (data: Buffer) => ImageData;
}

const decoders = new Map<string, Decoder>([
  ['image/png', { extensions: ['png'], decode: (data) => PNG.sync.read(data) }],
  ['image/jpeg', { extensions: ['jpg', 'jpeg'], decode: (data) => jpeg.decode(data) }],
  ['image/webp', { extensions: ['webp'], decode: (data) => webp.decode(data) }],
]);

const isRemoteUrl = (src: string): boolean => /^https?:\/\//i.test(src);

const isBufferObject = (src: object): src is BufferObject => (
  'data' in src && Buffer.isBuffer(src.data)
);

const isUrlRequestObject = (src: object): src is UrlRequestObject => (
  'url' in src && typeof src.url === 'string' && src.url.length > 0
);

const fetchImage = async (src: string | UrlRequestObject): Promise<LoadedImage> => {
  // `encoding` is a leftover from the `request` library and is not a valid fetch option
  const { url, encoding, ...init } = typeof src === 'string' ? { url: src } : src;

  const response = await fetch(url, init);
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Failed to fetch image. HTTP status: ${response.status} ${response.statusText}`);
  }

  const data = Buffer.from(await response.arrayBuffer());
  return { data, name: new URL(response.url || url).pathname };
};

const loadImage = async (src: ImageSource): Promise<LoadedImage> => {
  if (typeof src === 'string') {
    if (isRemoteUrl(src)) {
      return fetchImage(src);
    }
    return { data: await readFile(src), name: src };
  }
  if (Buffer.isBuffer(src)) {
    return { data: src };
  }
  if (isBufferObject(src)) {
    return { data: src.data, name: src.name, mime: src.ext || undefined };
  }
  if (isUrlRequestObject(src)) {
    return fetchImage(src);
  }
  throw new TypeError('Unrecognized image source');
};

const getDecoder = async ({ data, name, mime }: LoadedImage): Promise<Decoder> => {
  const type = mime ?? (await fileTypeFromBuffer(data))?.mime;
  if (!type) {
    throw new Error('Mime type not found');
  }

  const decoder = decoders.get(type);
  const ext = name ? path.extname(name).slice(1).toLowerCase() : '';

  if (ext) {
    if (!decoder?.extensions.includes(ext)) {
      throw new Error(`Unrecognized file extension, mime type or mismatch, ext: ${ext} / mime: ${type}`);
    }
    return decoder;
  }

  if (process.env.VERBOSE) console.warn('No file extension found, attempting mime typing.');
  if (!decoder) {
    throw new Error(`Unrecognized mime type: ${type}`);
  }
  return decoder;
};

/**
 * Create a perceptual hash of an image.
 *
 * @param src A file path, an http(s) URL, a Buffer, a `BufferObject` or a `UrlRequestObject`.
 * @param bits The number of bits in a row. The more bits, the more unique the hash.
 * @param precise `true` for the precise but slower algorithm, `false` for the quick one.
 * @returns The hash as a hex string.
 */
export const imageHash = async (src: ImageSource, bits = 16, precise = true): Promise<string> => {
  if (src == null) {
    throw new TypeError('No image source provided');
  }
  if (!Number.isInteger(bits) || bits <= 0) {
    throw new TypeError(`bits must be a positive integer, received: ${String(bits)}`);
  }

  const image = await loadImage(src);
  const decoder = await getDecoder(image);
  return blockhash(decoder.decode(image.data), bits, precise ? 2 : 1);
};
