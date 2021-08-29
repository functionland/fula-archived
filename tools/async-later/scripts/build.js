import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';

build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/esm.js',
});

const packages = JSON.parse(fs.readFileSync(path.resolve('./package.json'), { encoding: 'utf8' }));
const external = Object.keys(packages.devDependencies);

build({
  entryPoints: ['src/test.js'],
  platform: 'node',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/test.js',
  external,
});
