import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { imageHash } from '../src/index.js';

const fixture = (name: string) => path.join(import.meta.dirname, '../example', name);

const JPG_HASH = '0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0';
const PNG_HASH = '00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe';

// Like a bundle that does not include webp.wasm: @cwasm/webp throws as soon as it is loaded
const webpLoaded = vi.hoisted(() => vi.fn());
vi.mock('@cwasm/webp', () => {
  webpLoaded();
  throw new Error('ENOENT: no such file or directory, open webp.wasm');
});

describe('when webp.wasm cannot be loaded', () => {
  it('still hashes JPEG and PNG images', async () => {
    await expect(imageHash(fixture('_95695590_tv039055678.jpg'))).resolves.toBe(JPG_HASH);
    await expect(imageHash(fixture('Example.png'))).resolves.toBe(PNG_HASH);
    expect(webpLoaded).not.toHaveBeenCalled();
  });

  it('rejects a WebP image', async () => {
    await expect(imageHash(fixture('Example2.webp'))).rejects.toThrow();
    expect(webpLoaded).toHaveBeenCalled();
  });
});
