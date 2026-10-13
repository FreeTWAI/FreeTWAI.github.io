import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderDirectory, validateDirectory } from '../src/index.mjs';

test('the directory links all nine source repositories and claims no verified release', async () => {
  const directory = JSON.parse(await readFile(new URL('../data/directory.json', import.meta.url), 'utf8'));
  const html = renderDirectory(directory);
  assert.equal(directory.projects.length, 9);
  for (const project of directory.projects) assert.ok(html.includes(`https://github.com/FreeTWAI/${project.repository}`));
  assert.match(html, /不代表各項產品已正式上線/);
  assert.doesNotMatch(html, /<script|https:\/\/staging\./);
});
test('directory text is escaped and repository names cannot inject URLs or paths', () => {
  const project = { repository: 'example', name: '<script>x</script>', description: 'Example', scope: 'Source only' };
  const input = { schema_version: 'freedom.source-directory/v1', organization: 'FreeTWAI', projects: [project] };
  assert.match(renderDirectory(input), /&lt;script&gt;/);
  assert.throws(() => validateDirectory({ ...input, projects: [{ ...project, repository: '../../private' }] }), /Invalid repository/);
  assert.throws(() => validateDirectory({ ...input, projects: [project, { ...project, repository: 'EXAMPLE' }] }), /Duplicate/);
});
