import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';

const packages = JSON.parse(
  fs.readFileSync(path.resolve('./package.json'), { encoding: 'utf8' })
);
const external = Object.keys(packages.dependencies).filter(
  (name) => !name.startsWith('@functionland')
);

build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  external: [
      'wrtc',
      'libp2p',
      'leveldown',
      '@functionland/file-protocol',
      'ipfs',
      'ipfs-core'
  ]
});
