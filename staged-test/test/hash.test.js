import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { imageHash } from 'image-hash';

// Images from the repository's example folder, with their hashes from image-hash 7.0.1
const fixture = (name) => path.join(import.meta.dirname, '../../example', name);

const JPG_HASH = '0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0';
const JPG_QUICK_HASH = '0773063f063f36070e070a070f379e770f000fff0fff020303f00ffb0f810ff0';
const PNG_HASH = '00007ffe7c3e780e601e603e7ffe7ffe47fe020642067ff66b066a567ffe7ffe';
const WEBP_HASH = '07ec07fe05e401e700e707e703c70fc707c327c72e472e077f0f7e07fc070006';

describe('import', () => {
  for (const [file, hash] of [
    ['_95695590_tv039055678.jpg', JPG_HASH],
    ['Example.png', PNG_HASH],
    ['Example2.webp', WEBP_HASH],
    ['_95695592_tv039055678jpeg', JPG_HASH],
  ]) {
    it(`hashes ${file}`, async () => {
      assert.equal(await imageHash(fixture(file), 16, true), hash);
    });
  }

  it('hashes with the quick method and other bit sizes', async () => {
    assert.equal(await imageHash(fixture('_95695590_tv039055678.jpg'), 16, false), JPG_QUICK_HASH);
    assert.equal(await imageHash(fixture('_95695590_tv039055678.jpg'), 8, true), '35313135381d1c3c');
  });

  it('defaults to 16 bits with the precise method', async () => {
    assert.equal(await imageHash(fixture('_95695590_tv039055678.jpg')), JPG_HASH);
  });

  it('hashes a Buffer and a buffer object', async () => {
    const data = await readFile(fixture('_95695591_tv039055678.jpeg'));
    assert.equal(await imageHash(data), JPG_HASH);
    assert.equal(await imageHash({ data, ext: 'image/jpeg' }), JPG_HASH);
  });

  it('rejects an unsupported image type', async () => {
    await assert.rejects(imageHash(fixture('giphygif')), /Unrecognized mime type: image\/gif/);
  });
});

describe('require', () => {
  it('hashes an image from CommonJS', async () => {
    const require = createRequire(import.meta.url);
    const { imageHash: requiredImageHash } = require('image-hash');
    assert.equal(await requiredImageHash(fixture('Example.png'), 16, true), PNG_HASH);
  });
});

describe('remote images', () => {
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
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it('hashes a url', async () => {
    assert.equal(await imageHash(`${baseUrl}/_95695590_tv039055678.jpg`), JPG_HASH);
  });

  it('passes fetch options from a request object', async () => {
    const url = `${baseUrl}/private/Example2.webp`;
    await assert.rejects(imageHash({ url }), /401/);
    assert.equal(await imageHash({ url, headers: { authorization: 'Bearer token' } }), WEBP_HASH);
  });
});
