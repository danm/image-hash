import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const installedDir = path.join(import.meta.dirname, '../node_modules/image-hash');
const manifest = JSON.parse(await readFile(path.join(installedDir, 'package.json'), 'utf8'));

describe('installed package', () => {
  it('is the tarball installed in this folder', (t) => {
    t.diagnostic(`testing image-hash@${manifest.version}`);
    const resolved = fileURLToPath(import.meta.resolve('image-hash'));
    assert.equal(resolved, path.join(installedDir, 'lib/index.js'));
  });

  it('only contains the build, README, LICENSE and package.json', async () => {
    const entries = await readdir(installedDir, { recursive: true, withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.relative(installedDir, path.join(entry.parentPath, entry.name)));

    const unexpected = files.filter((file) => (
      !file.startsWith(`lib${path.sep}`) && !['LICENSE', 'README.md', 'package.json'].includes(file)
    ));
    assert.deepEqual(unexpected, []);
    assert.ok(files.includes(path.join('lib', 'index.js')));
    assert.ok(files.includes(path.join('lib', 'index.d.ts')));
  });

  it('is an ESM package with types in its exports', () => {
    assert.equal(manifest.type, 'module');
    assert.deepEqual(manifest.exports['.'], { types: './lib/index.d.ts', default: './lib/index.js' });
    assert.ok(manifest.engines?.node, 'engines.node is set');
  });

  it('has no install scripts', () => {
    for (const script of ['preinstall', 'install', 'postinstall', 'prepare']) {
      assert.equal(manifest.scripts?.[script], undefined, `${script} script`);
    }
  });
});
