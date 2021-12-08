import esbuild from 'esbuild';
import path from 'path';
import babel from 'esbuild-plugin-babel';

esbuild.build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: ['es6'],
  format: 'esm',
  bundle: true,
  sourcemap: true,
  plugins: [babel()],
  outfile: 'dist/browser/esm.js',
  define: {
    global: 'globalThis'
  }
});

esbuild.build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  target: 'node14',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/cjs.js',
  define: {
    global: 'globalThis'
  },
  inject: [path.resolve('scripts/node-globals.mjs')]
});

esbuild.build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'esm',
  target: 'node14',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/esm.js',
  define: {
    global: 'globalThis'
  },
  inject: [path.resolve('scripts/node-globals.mjs')]
});
