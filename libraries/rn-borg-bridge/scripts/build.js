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
  outfile: 'dist/index.js',
  minify:true,
  define: {
    global: 'globalThis',
  },
  inject: [path.resolve('scripts/node-globals.js')],
  plugins: [
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: false,
      define: { 'process.env.NODE_ENV': '"production"' }, // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    })
  ],
});
