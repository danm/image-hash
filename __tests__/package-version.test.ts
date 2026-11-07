import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';

it('allows npm to bump the package patch version for deployment', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'image-hash-version-'));
  try {
    copyFileSync(new URL('../package.json', import.meta.url), path.join(directory, 'package.json'));
    const version = execFileSync('npm', ['version', 'patch', '--no-git-tag-version', '--ignore-scripts'], {
      cwd: directory,
      encoding: 'utf8',
    });
    expect(version.trim()).toMatch(/^v\d+\.\d+\.\d+$/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
