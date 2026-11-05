import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { renderDirectory } from '../src/index.mjs';
import { renderPrivacyPage } from '../src/privacy.mjs';
const [directoryFile, privacyFile] = await Promise.all([
  readFile(new URL('../data/directory.json', import.meta.url), 'utf8'),
  readFile(new URL('../data/privacy-discord-bot.json', import.meta.url), 'utf8')
]);
const directory = JSON.parse(directoryFile);
const privacy = JSON.parse(privacyFile);
// Validate both inputs, including the privacy output path, before any writes.
const directoryHtml = renderDirectory(directory);
const privacyHtml = renderPrivacyPage(privacy);
await Promise.all([
  mkdir(new URL('../dist/', import.meta.url), { recursive: true }).then(() =>
    writeFile(new URL('../dist/index.html', import.meta.url), directoryHtml)
  ),
  mkdir(new URL(`../dist/${privacy.path}`, import.meta.url), { recursive: true }).then(() =>
    writeFile(new URL(`../dist/${privacy.path}index.html`, import.meta.url), privacyHtml)
  )
]);
console.log(`Built source directory at dist/index.html and privacy page at dist/${privacy.path}index.html; deployment is done by .github/workflows/pages.yml on main.`);
