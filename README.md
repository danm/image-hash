# image-hash

A wrapper around [block-hash](https://github.com/commonsmachinery/blockhash-js) to easily hash a local or remote file with Node.

Supports JPG, PNG and WebP

## Install

```bash
npm i image-hash
```

Requires Node.js 22.12 or later.

## Use

`imageHash` returns a promise that resolves to the hash as a hex string.

```javascript
import { readFile } from 'node:fs/promises';
import { imageHash } from 'image-hash';

// local file
const hash = await imageHash('./_95695590_tv039055678.jpg', 16, true);
console.log(hash);
// 0773063f063f36070e070a070f378e7f1f000fff0fff020103f00ffb0f810ff0

// bits and precise are optional, and default to 16 and true
await imageHash('./_95695590_tv039055678.jpg');

// remote file
await imageHash('https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg', 16, true);

// remote file with fetch options
await imageHash({
  url: 'https://ichef-1.bbci.co.uk/news/660/cpsprodpb/7F76/production/_95703623_mediaitem95703620.jpg',
  headers: { authorization: 'Bearer token' },
  signal: AbortSignal.timeout(10_000),
}, 16, true);

// Buffer
const data = await readFile('./_95695591_tv039055678.jpeg');
await imageHash(data, 16, true);

// Buffer, with mime type and file name
await imageHash({ ext: 'image/jpeg', data, name: 'photo.jpeg' }, 16, true);
```

Errors (file not found, unsupported image type, failed requests) reject the promise, so use `try`/`catch` or `.catch()`.

```javascript
try {
  await imageHash('./missing.jpg');
} catch (error) {
  console.error(error);
}
```

The package is ESM, but CommonJS projects can still `require` it:

```javascript
const { imageHash } = require('image-hash');

imageHash('./_95695590_tv039055678.jpg').then((hash) => console.log(hash));
```

## API

```typescript
imageHash(src: string | Buffer | UrlRequestObject | BufferObject, bits?: number, precise?: boolean): Promise<string>
```

| Argument | Type | Description | Default | Example |
| -------- | ---- | ----------- | ------- | ------- |
| src | `string`, `Buffer` or `object` | A file path, an `http(s)` URL, a `Buffer`, a request object with a remote `url`, or a buffer object (see below) | Required | `'./image.jpg'` |
| bits | `number` | The number of bits in a row. The more bits, the more unique the hash. Must be a positive integer. | `16` | `8` |
| precise | `boolean` | Whether a precision algorithm is used. `true` Precise but slower, non-overlapping blocks. `false` Quick and crude, non-overlapping blocks. Method 2 is recommended as a good tradeoff between speed and good matches on any image size. The quick ones are only advisable when the image width and height are an even multiple of the number of blocks used. | `true` | `false` |

### Source Object Types

```typescript
// Request object. Any other fetch options (headers, signal, ...) are passed to fetch.
interface UrlRequestObject extends RequestInit {
  url: string;
}

// Buffer object
interface BufferObject {
  ext?: string; // mime type of the image, detected from the data if omitted
  data: Buffer;
  name?: string; // file name, used to check the extension matches the mime type
}
```

## Settings

Image hash will log out warnings if environment variable `VERBOSE` is set.

## Upgrading from v7

- The callback argument has been removed. `imageHash` now returns a promise.
- `bits` and `precise` are optional.
- A `Buffer` can be passed directly.
- The package is now ESM and requires Node.js 22.12 or later.

## Development

Built with TypeScript, ESLint and Vitest, using pnpm.

```bash
pnpm install
pnpm test
pnpm run lint
pnpm run typecheck
pnpm run build
```

## Publishing

Every push to `master` publishes a new patch version to npm. The CI workflow bumps the patch version, publishes, then pushes the version commit and tag back to `master`. For a major or minor release, set `version` in `package.json` to the version before the one you want, e.g. `9.0.0` to publish `9.0.1`.

Publishing uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is stored in GitHub. It is configured on npmjs.com under the package's Settings → Trusted Publisher, with the GitHub repository `danm/image-hash` and the workflow file `ci.yml`.

## Credit

The hard bit of this comes with thanks from [commonsmachinery](https://github.com/commonsmachinery) for [blockhash-js](https://github.com/commonsmachinery/blockhash-js)

## License

Distributed under an MIT license
