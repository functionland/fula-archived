const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/browser/esm.js',
  tsconfig:'./tsconfig.browser.json'
});

esbuild.build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/cjs.js',
  tsconfig:'./tsconfig.node.json'
});