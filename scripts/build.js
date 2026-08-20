import { build } from 'esbuild';

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
});

console.log('Built src/ui-feedback.js from src/index.js');
