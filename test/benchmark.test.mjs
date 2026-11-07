import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'freedom-benchmark-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['scripts']) {
    await cp(new URL(`../${directory}/`, import.meta.url), join(root, directory), { recursive: true });
  }
  return { root, run: () => run(process.execPath, ['scripts/benchmark.mjs'], { cwd: root }) };
}

test('benchmark script handles successful file size measurements', async (t) => {
  const { root, run } = await fixture(t);

  // Create mock dist directory and files
  await mkdir(join(root, 'dist/privacy/discord-bot'), { recursive: true });
  await writeFile(join(root, 'dist/index.html'), '<html>Mock Index</html>');
  await writeFile(join(root, 'dist/privacy/discord-bot/index.html'), '<html>Mock Privacy</html>');

  const { stdout, stderr } = await run();

  assert.equal(stderr, '');
  assert.match(stdout, /--- Performance Benchmark ---/);
  assert.match(stdout, /1\. File Sizes/);
  assert.match(stdout, /dist\/index\.html: [0-9.]+ KB/);
  assert.match(stdout, /dist\/privacy\/discord-bot\/index\.html: [0-9.]+ KB/);
  assert.match(stdout, /2\. Font Loading Performance/);
  assert.match(stdout, /3\. Hydration Speed/);
});

test('benchmark script gracefully handles missing files', async (t) => {
  const { root, run } = await fixture(t);

  // Ensure we don't have dist directory in the root
  const { stdout, stderr } = await run();

  assert.equal(stderr, '');
  assert.match(stdout, /--- Performance Benchmark ---/);
  assert.match(stdout, /\.\.\/dist\/index\.html: File not found/);
  assert.match(stdout, /\.\.\/dist\/privacy\/discord-bot\/index\.html: File not found/);
});
