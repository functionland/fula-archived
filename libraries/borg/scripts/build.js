import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { build } from 'esbuild';

build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  define: {
    global: 'globalThis'
  },
  plugins: [
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
      define: { 'process.env.NODE_ENV': '"production"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    })
  ],
  external: [
    'peer-id',
    'libp2p',
    '@chainsafe/libp2p-noise',
    'libp2p-webrtc-star',
    'libp2p-bootstrap',
    'libp2p-mplex',
    'libp2p-websockets'
  ]
});
