import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { build } from 'esbuild';
import browserify from 'browserify';
import * as fs from 'fs'

await build({
  entryPoints: ['tests/fula.test.ts'],
  platform: 'browser',
  target: 'es2018',
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/temp.js',
  define: {
    global: 'globalThis'
  },
  plugins: [
    NodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
      define: { 'process.env.NODE_ENV': '"test"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    }),
  ],
  external: [
    'peer-id',
    'esbuild-plugin-babel',
    'libp2p',
    '@chainsafe/libp2p-noise',
    'libp2p-webrtc-star',
    'libp2p-bootstrap',
    'libp2p-mplex',
    'libp2p-websockets',
    'libp2p-tcp'
  ]
});

const b = browserify()
b.add('dist/temp.js')
const stream = b.bundle()
const dest = fs.createWriteStream('dist/test.js')
stream.pipe(dest)

stream.once('end',()=>{
  fs.rmSync('dist/temp.js')
})


await build({
  entryPoints: ['tests/fula.test.ts'],
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/node_test.cjs',
  define: {
    global: 'globalThis'
  },
  external: [
    'peer-id',
    'esbuild-plugin-babel',
    'libp2p',
    '@chainsafe/libp2p-noise',
    'libp2p-webrtc-star',
    'libp2p-bootstrap',
    'libp2p-mplex',
    'libp2p-websockets',
    'wrtc',
    'libp2p-tcp'
  ]
});

