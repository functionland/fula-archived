import { build } from 'esbuild';

build({
  entryPoints: ['src/graph.js'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/esm.js',
});