import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'

import { build } from 'esbuild';


await build({
  entryPoints: ['__tests__/did-document-test/index.test.ts', 
  '__tests__/did-jwe-encdec-test/jwe.encdec.test.ts', '__tests__/did-provider-proto/provider-proto.example.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outExtension: {'.js':'.cjs'},
  outdir: 'dist/__tests__/'
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




