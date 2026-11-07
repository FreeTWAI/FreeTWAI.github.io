import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'freedom-verify-contracts-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['scripts', 'vendor']) {
    await cp(new URL(`../${directory}/`, import.meta.url), join(root, directory), { recursive: true });
  }
  await cp(new URL('../contracts.lock.json', import.meta.url), join(root, 'contracts.lock.json'));
  return {
    root,
    run: () => run(process.execPath, ['scripts/verify-contracts.mjs'], { cwd: root })
  };
}

test('verify-contracts succeeds with valid canonical repository', async (t) => {
  const { run } = await fixture(t);
  const { stdout, stderr } = await run();
  assert.equal(stderr, '');
  assert.match(stdout, /artifacts verified/);
});

test('verify-contracts rejects invalid source repository', async (t) => {
  const { root, run } = await fixture(t);
  const lockPath = join(root, 'contracts.lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  lock.source_repository = 'Fake/Repository';
  await writeFile(lockPath, JSON.stringify(lock));
  await assert.rejects(run(), error => error.code === 1 && /Invalid canonical contract source/.test(error.stderr));
});

test('verify-contracts rejects modified bundle digest in lock', async (t) => {
  const { root, run } = await fixture(t);
  const lockPath = join(root, 'contracts.lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  lock.bundle_sha256 = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  await writeFile(lockPath, JSON.stringify(lock));
  await assert.rejects(run(), error => error.code === 1 && /Contract bundle digest differs from lock/.test(error.stderr));
});

test('verify-contracts rejects modified canonical artifact file content', async (t) => {
  const { root, run } = await fixture(t);
  const protocolPath = join(root, 'vendor/freedom-platform/protocol.mjs');
  const content = await readFile(protocolPath, 'utf8');
  await writeFile(protocolPath, content + '\n// modified');
  await assert.rejects(run(), error => error.code === 1 && /Modified canonical artifact protocol.mjs/.test(error.stderr));
});

test('verify-contracts rejects missing canonical artifact file', async (t) => {
  const { root, run } = await fixture(t);
  const protocolPath = join(root, 'vendor/freedom-platform/protocol.mjs');
  await rm(protocolPath);
  await assert.rejects(run(), error => error.code === 1 && /ENOENT: no such file or directory/.test(error.stderr));
});

test('verify-contracts rejects unexpected file in vendor bundle', async (t) => {
  const { root, run } = await fixture(t);
  await writeFile(join(root, 'vendor/freedom-platform/unexpected.txt'), 'hello');
  await assert.rejects(run(), error => error.code === 1 && /Unexpected bundle file unexpected\.txt/.test(error.stderr));
});
