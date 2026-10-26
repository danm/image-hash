# staged-test

Tests a staged image-hash release before you approve it on npm. It installs the staged tarball the way a user would install the package, then checks it:

- **Contents:** the tarball only contains `lib/`, `README.md`, `LICENSE` and `package.json`, and has no install scripts.
- **Runtime:** `import` and `require` both work, and the example images hash to the expected values. That includes files, Buffers, URLs and request objects with fetch options.
- **Types:** the published declarations type check in a TypeScript ESM project.

Needs Node.js 22.12 or later and npm 11.

## Test a staged version

The CI log for the "Stage on npm" step prints the stage id, e.g. `staged with id f67807b7-b677-43c6-b4ff-d9659b1a6854`.

```bash
cd staged-test
npm install
npm stage download <stage-id>
npm install --no-save ./image-hash-<version>-<stage-id>.tgz
npm test
```

`npm stage download` prints the tarball's shasum. It should match the shasum in the CI log.

If the tests pass, approve it on npmjs.com or with `npm stage approve <stage-id>`.

## Test any tarball

To test the package before it is staged, pack it from the repository root and install that tarball instead:

```bash
pnpm run build
pnpm pack --pack-destination staged-test
cd staged-test
npm install --no-save ./image-hash-<version>.tgz
npm test
```
