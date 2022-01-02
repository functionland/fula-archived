import { build } from 'esbuild';
import babel from 'esbuild-plugin-babel';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill'


build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es6',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  plugins: [babel()],
  outfile: 'dist/browser/cjs.cjs',
  tsconfig: './tsconfig.browser.json'
});

build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'esnext',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/browser/esm.js',
  tsconfig: './tsconfig.browser.json'
});

build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  target: 'node14',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/cjs.cjs',
  tsconfig: './tsconfig.node.json'
});

build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  target: 'node14',
  format: "esm",
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/esm.js'
});


build({
  entryPoints: ['tests/async-later.test.ts'],
  platform: 'browser',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/browser/test.js',
  define: {
    global: 'window'
  },
  plugins: [
    NodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
      define: { 'process.env.NODE_ENV': '"dev"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    })
  ],

});

build({
  entryPoints: ['tests/async-later.test.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/node/test.cjs',
});
