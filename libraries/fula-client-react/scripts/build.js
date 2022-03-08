import { build } from 'esbuild';
import { clean } from 'build-helpers'

clean()

await build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2018',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/br/index.js',
  external: [
    'react','react-dom'
  ]
});






