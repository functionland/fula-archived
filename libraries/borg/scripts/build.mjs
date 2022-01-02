import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2018',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  define: {
    global: 'globalThis'
  },
  plugins: [
    NodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
      define: { 'process.env.NODE_ENV': '"dev"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    })
  ],
  external: [
    '@chainsafe/libp2p-noise',
  ]
});

// const b = browserify()
// b.add('dist/temp.js')
// const stream = b.bundle()
// const dest = fs.createWriteStream('dist/index.js')
// stream.pipe(dest)
//
// stream.once('end',()=>{
//   fs.rmSync('dist/temp.js')
// })






