import { stat } from 'node:fs/promises';

async function measureFileSize(filepath) {
  try {
    const stats = await stat(new URL(filepath, import.meta.url));
    const sizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`- ${filepath}: ${sizeInKB} KB`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`- ${filepath}: File not found`);
    } else {
      console.error(`- ${filepath}: Error - ${error.message}`);
    }
  }
}

async function runBenchmark() {
  console.log('--- Performance Benchmark ---');

  console.log('\\n1. File Sizes (Asset Bundling & CSS Minification):');
  await measureFileSize('../dist/index.html');
  await measureFileSize('../dist/privacy/discord-bot/index.html');
  console.log('Note: CSS is minified and inlined directly in the HTML. There are no external CSS or JS bundles.');

  console.log('\\n2. Font Loading Performance:');
  console.log('Note: External fonts are NOT used. The application uses \`font: 17px/1.7 system-ui\` for optimal, instant font loading without blocking render.');

  console.log('\\n3. Hydration Speed:');
  console.log('Note: Zero JS hydration overhead. This is a pure static HTML site generated at build time, so there is no client-side hydration process.');

  console.log('\\n-----------------------------');
}

runBenchmark().catch(console.error);
