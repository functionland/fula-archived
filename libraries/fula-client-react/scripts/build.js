import { build } from 'esbuild';
import {EsmExternalsPlugin} from '@esbuild-plugins/esm-externals'


await build({
  entryPoints: ['src/index.ts'],
  platform: 'browser',
  target: 'es2018',
  format: 'esm',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/br/index.js',
  plugins: [EsmExternalsPlugin({ externals: ['react', 'react-dom'] })]
});






