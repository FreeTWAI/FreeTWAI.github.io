import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { renderDirectory } from '../src/index.mjs';
import { renderPrivacyPage } from '../src/privacy.mjs';

const run = promisify(execFile);
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'freedom-directory-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['scripts', 'src', 'data']) {
    await cp(new URL(`../${directory}/`, import.meta.url), join(root, directory), { recursive: true });
  }
  const privacy = JSON.parse(await readFile(join(root, 'data/privacy-discord-bot.json'), 'utf8'));
  return { root, privacy, build: () => run(process.execPath, ['scripts/build.mjs'], { cwd: root, timeout: 10000 }) };
}

test('actual build rejects traversal before creating any output directories', async (t) => {
  const { root, privacy, build } = await fixture(t);
  const before = (await readdir(root)).sort();
  privacy.path = '../outside-dist/';
  await writeFile(join(root, 'data/privacy-discord-bot.json'), JSON.stringify(privacy));
  await assert.rejects(build(), error => error.code === 1 && /Invalid page path/.test(error.stderr));
  assert.deepEqual((await readdir(root)).sort(), before);
});

test('actual build validates privacy content before writing either artifact', async (t) => {
  const { root, privacy, build } = await fixture(t);
  const before = (await readdir(root)).sort();
  privacy.en.sections = [];
  await writeFile(join(root, 'data/privacy-discord-bot.json'), JSON.stringify(privacy));
  await assert.rejects(build(), error => error.code === 1 && /Invalid en policy/.test(error.stderr));
  assert.deepEqual((await readdir(root)).sort(), before);
});

test('actual valid build preserves both rendered artifacts', async (t) => {
  const { root, privacy, build } = await fixture(t);
  const directory = JSON.parse(await readFile(join(root, 'data/directory.json'), 'utf8'));
  await build();
  assert.equal(await readFile(join(root, 'dist/index.html'), 'utf8'), renderDirectory(directory));
  assert.equal(await readFile(join(root, 'dist', privacy.path, 'index.html'), 'utf8'), renderPrivacyPage(privacy));
});

test('static site build validates metadata, syntax, and internal assets', async (t) => {
  const { root, privacy, build } = await fixture(t);
  await build();

  const pages = [
    { path: 'dist/index.html', dir: 'dist' },
    { path: join('dist', privacy.path, 'index.html'), dir: join('dist', privacy.path) }
  ];

  for (const page of pages) {
    const html = await readFile(join(root, page.path), 'utf8');

    // Metadata tags
    assert.match(html, /<meta charset="utf-8">/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.match(html, /<meta http-equiv="Content-Security-Policy" content="[^"]*">/);

    // Basic HTML syntax
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<html lang="[a-zA-Z-]+">/);
    assert.match(html, /<head>[\s\S]*<\/head>/i);
    assert.match(html, /<style>[\s\S]*<\/style>/i);
    assert.match(html, /<body>[\s\S]*<\/body>/i);
    assert.match(html, /<\/html>\s*$/i);

    // Basic CSS syntax check (extract content inside <style>)
    const styleMatches = html.matchAll(/<style>([\s\S]*?)<\/style>/gi);
    for (const match of styleMatches) {
      const css = match[1];
      // A very basic check: curly braces should be balanced
      const openBraces = (css.match(/{/g) || []).length;
      const closeBraces = (css.match(/}/g) || []).length;
      assert.equal(openBraces, closeBraces, 'CSS should have balanced curly braces');
    }

    // Asset validation (both href and src)
    const links = [
      ...Array.from(html.matchAll(/href="([^"]+)"/g)).map(m => m[1]),
      ...Array.from(html.matchAll(/src="([^"]+)"/g)).map(m => m[1])
    ];

    for (const link of links) {
      if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('#')) {
        continue;
      }

      // Internal links should resolve to a valid built asset
      let assetPath;
      if (link.startsWith('/')) {
        assetPath = join(root, 'dist', link);
      } else {
        assetPath = join(root, page.dir, link);
      }

      let isFile = false;
      let isDir = false;
      try {
        const stats = await stat(assetPath);
        isFile = stats.isFile();
        isDir = stats.isDirectory();
      } catch {
        assert.fail(`Internal asset link broken: ${link} on page ${page.path} (resolved to ${assetPath})`);
      }

      if (isDir) {
        try {
          const indexStats = await stat(join(assetPath, 'index.html'));
          assert.ok(indexStats.isFile(), `Directory link ${link} missing index.html`);
        } catch {
          assert.fail(`Directory link ${link} missing index.html`);
        }
      } else {
        assert.ok(isFile, `Link ${link} does not point to a valid file`);
      }
    }
  }
});
