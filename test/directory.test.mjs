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

test('validates root input properties', () => {
  const validProject = { repository: 'example', name: 'Example', description: 'Example', scope: 'Scope' };
  const baseInput = { schema_version: 'freedom.source-directory/v1', organization: 'FreeTWAI', projects: [validProject] };

  // Valid should not throw
  validateDirectory(baseInput);

  // Missing or invalid schema
  assert.throws(() => validateDirectory(null), /Expected the FreeTWAI public source directory/);
  assert.throws(() => validateDirectory({ ...baseInput, schema_version: 'invalid' }), /Expected the FreeTWAI public source directory/);

  // Wrong organization
  assert.throws(() => validateDirectory({ ...baseInput, organization: 'Other' }), /Expected the FreeTWAI public source directory/);

  // Invalid projects array
  assert.throws(() => validateDirectory({ ...baseInput, projects: null }), /Expected the FreeTWAI public source directory/);

  // > 100 projects
  const tooManyProjects = Array.from({ length: 101 }, (_, i) => ({ ...validProject, repository: `repo-${i}` }));
  assert.throws(() => validateDirectory({ ...baseInput, projects: tooManyProjects }), /Expected the FreeTWAI public source directory/);
});

test('validates project properties', () => {
  const validProject = { repository: 'example', name: 'Example', description: 'Example', scope: 'Scope' };
  const baseInput = { schema_version: 'freedom.source-directory/v1', organization: 'FreeTWAI', projects: [] };

  // Missing repository (null/undefined/empty)
  assert.throws(() => validateDirectory({ ...baseInput, projects: [null] }), /Invalid repository name/);
  assert.throws(() => validateDirectory({ ...baseInput, projects: [{ ...validProject, repository: undefined }] }), /Invalid repository name/);

  // Invalid string values, empty strings, strings > 500 chars
  for (const key of ['name', 'description', 'scope']) {
    assert.throws(() => validateDirectory({ ...baseInput, projects: [{ ...validProject, [key]: undefined }] }), new RegExp(`Invalid ${key}`));
    assert.throws(() => validateDirectory({ ...baseInput, projects: [{ ...validProject, [key]: '   ' }] }), new RegExp(`Invalid ${key}`));
    assert.throws(() => validateDirectory({ ...baseInput, projects: [{ ...validProject, [key]: 'a'.repeat(501) }] }), new RegExp(`Invalid ${key}`));
  }
});
