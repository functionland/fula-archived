import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { build } from 'esbuild';
// import browserify from 'browserify';
// import * as fs from 'fs'

await build({
  entryPoints: ['__tests__/full.test.ts', '__tests__/did-document-test/index.test.ts', 
  '__tests__/did-jwe-encdec-test/jwe.encdec.test.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outExtension: {'.js':'.cjs'},
  outdir: 'dist/__tests__/',
});

// const b = browserify()
// b.add('dist/temp.js')
// const stream = b.bundle()
// const dest = fs.createWriteStream('dist/test.js')
// stream.pipe(dest)
//
// stream.once('end',()=>{
//   fs.rmSync('dist/temp.js')
// })




