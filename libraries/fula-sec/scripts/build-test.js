import { build } from 'esbuild';


await build({
  entryPoints: ['tests/asym.enc.test.ts','tests/tagged.enc.test.ts','tests/did.test.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outExtension: {'.js':'.cjs'},
  outdir: 'dist/tests/',
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




