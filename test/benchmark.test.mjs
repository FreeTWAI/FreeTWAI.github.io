import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderDirectory } from '../src/index.mjs';
import { renderPrivacyPage } from '../src/privacy.mjs';

test('performance benchmark: renderDirectory executes quickly over thousands of iterations', async () => {
  const directory = JSON.parse(await readFile(new URL('../data/directory.json', import.meta.url), 'utf8'));
  const start = performance.now();
  for (let i = 0; i < 5000; i++) {
    renderDirectory(directory);
  }
  const end = performance.now();
  const duration = end - start;
  assert.ok(duration < 2000, `renderDirectory 5000 iterations took ${duration.toFixed(2)}ms, expected under 2000ms`);
});

test('performance benchmark: renderPrivacyPage executes quickly over thousands of iterations', async () => {
  const privacy = JSON.parse(await readFile(new URL('../data/privacy-discord-bot.json', import.meta.url), 'utf8'));
  const start = performance.now();
  for (let i = 0; i < 5000; i++) {
    renderPrivacyPage(privacy);
  }
  const end = performance.now();
  const duration = end - start;
  assert.ok(duration < 2000, `renderPrivacyPage 5000 iterations took ${duration.toFixed(2)}ms, expected under 2000ms`);
});
