import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { build } from 'esbuild';
import path from 'path';

build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/esm.js',
});
