import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

await build({
  entryPoints: ['src/index.js'],
  outfile: 'src/ui-feedback.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  legalComments: 'none',
  sourcemap: false,
  minify: false,
  banner: { js: `// UI Feedback Tool v${packageJson.version}` },
});

console.log('Built src/ui-feedback.js from src/index.js');
