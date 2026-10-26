import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { imageHash } from '../src/index.js';

const fixture = (name: string) => path.join(import.meta.dirname, '../example', name);

const JPG_HASH = '0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0';
const JPG_QUICK_HASH = '0773063f063f36070e070a070f379e770f000fff0fff020303f00ffb0f810ff0';
const PNG_HASH = '00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe';
const WEBP_HASH = '07ec07fe05e401e700e707e703c70fc707c327c72e472e077f0f7e07fc070006';

// Serves files from the example folder. Paths under /private/ require an authorization header.
const server = createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (pathname.startsWith('/private/') && !req.headers.authorization) {
    res.writeHead(401).end();
    return;
  }
  readFile(fixture(path.basename(pathname))).then(
    (body) => res.end(body),
    () => res.writeHead(404).end(),
  );
});
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

describe('local files', () => {
  it.each([
    ['_95695590_tv039055678.jpg', JPG_HASH],
    ['_95695591_tv039055678.jpeg', JPG_HASH],
    ['_95695592_tv039055678jpeg', JPG_HASH],
    ['Example.png', PNG_HASH],
    ['Example2.PNG', PNG_HASH],
    ['Example', PNG_HASH],
    ['Example.webp', PNG_HASH],
    ['Example2.webp', WEBP_HASH],
  ])('hashes %s', async (file, hash) => {
    await expect(imageHash(fixture(file), 16, true)).resolves.toBe(hash);
  });

  it('uses the quick method when precise is false', async () => {
    await expect(imageHash(fixture('_95695590_tv039055678.jpg'), 16, false)).resolves.toBe(JPG_QUICK_HASH);
  });

  it('defaults to 16 bits with the precise method', async () => {
    await expect(imageHash(fixture('_95695590_tv039055678.jpg'))).resolves.toBe(JPG_HASH);
  });

  it('accepts a relative path', async () => {
    await expect(imageHash('example/Example.png', 16, true)).resolves.toBe(PNG_HASH);
  });

  it('rejects when the extension does not match the mime type', async () => {
    await expect(imageHash(fixture('jpgpretendingtobeapng.png'), 16, true)).rejects.toThrow('mismatch');
  });

  it('rejects when the file is not found', async () => {
    await expect(imageHash(fixture('jpgpreten.png'), 16, true)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('rejects when the mime type cannot be detected', async () => {
    await expect(imageHash(fixture('local-file-js'), 16, true)).rejects.toThrow('Mime type not found');
  });

  it('rejects an unsupported mime type', async () => {
    await expect(imageHash(fixture('giphygif'), 16, true)).rejects.toThrow('Unrecognized mime type: image/gif');
  });
});

describe('buffers', () => {
  it('hashes a Buffer', async () => {
    const data = await readFile(fixture('_95695591_tv039055678.jpeg'));
    await expect(imageHash(data, 16, true)).resolves.toBe(JPG_HASH);
  });

  it('hashes a buffer object with a mime type', async () => {
    const data = await readFile(fixture('_95695591_tv039055678.jpeg'));
    await expect(imageHash({ ext: 'image/jpeg', data }, 16, true)).resolves.toBe(JPG_HASH);
  });

  it('hashes a buffer object without a mime type', async () => {
    const data = await readFile(fixture('_95695591_tv039055678.jpeg'));
    await expect(imageHash({ data }, 16, true)).resolves.toBe(JPG_HASH);
  });

  it('ignores dots in directory names when checking the extension', async () => {
    const data = await readFile(fixture('Example'));
    await expect(imageHash({ data, name: 'some.dir/Example' }, 16, true)).resolves.toBe(PNG_HASH);
  });

  it('rejects a buffer object with an incorrect mime type', async () => {
    const data = await readFile(fixture('_95695591_tv039055678.jpeg'));
    await expect(imageHash({ ext: 'image/jpg', data }, 16, true)).rejects.toThrow('Unrecognized mime type');
  });
});

describe('remote files', () => {
  it('hashes a url', async () => {
    await expect(imageHash(`${baseUrl}/_95695590_tv039055678.jpg`, 16, true)).resolves.toBe(JPG_HASH);
  });

  it('hashes a url with a query string', async () => {
    await expect(imageHash(`${baseUrl}/Example.png?width=800`, 16, true)).resolves.toBe(PNG_HASH);
  });

  it('hashes a url without a file extension', async () => {
    await expect(imageHash(`${baseUrl}/_95695592_tv039055678jpeg`, 16, true)).resolves.toBe(JPG_HASH);
  });

  it('hashes a request object', async () => {
    await expect(imageHash({ url: `${baseUrl}/Example2.webp` }, 16, true)).resolves.toBe(WEBP_HASH);
  });

  it('passes fetch options from a request object', async () => {
    const url = `${baseUrl}/private/Example.png`;
    await expect(imageHash({ url }, 16, true)).rejects.toThrow('401');
    await expect(imageHash({ url, headers: { authorization: 'Bearer token' } }, 16, true)).resolves.toBe(PNG_HASH);
  });

  it('rejects when the url is not found', async () => {
    await expect(imageHash(`${baseUrl}/missing.jpg`, 16, true)).rejects.toThrow('HTTP status: 404');
  });
});

describe('arguments', () => {
  it('rejects when there is no src', async () => {
    // @ts-expect-error testing a missing source
    await expect(imageHash(undefined, 16, true)).rejects.toThrow('No image source provided');
  });

  it.each([0, -8, 1.5, Number.NaN])('rejects bits of %s', async (bits) => {
    await expect(imageHash(fixture('Example.png'), bits, true)).rejects.toThrow(TypeError);
  });
});
