import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2018',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/br/index.js',
});

await build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/node/index.cjs'
});





