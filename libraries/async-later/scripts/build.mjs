import { build } from 'esbuild';
import babel from 'esbuild-plugin-babel';


build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es6',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  plugins: [babel()],
  outfile: 'dist/browser/esm.js',
  tsconfig:'./tsconfig.browser.json'
});

build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  target: 'node14',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/cjs.js',
  tsconfig:'./tsconfig.node.json'
});

build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'esm',
  target: 'node14',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/esm.js',
  tsconfig:'./tsconfig.node.json'
});