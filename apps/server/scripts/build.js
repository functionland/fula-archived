const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

const packages = JSON.parse(fs.readFileSync(path.resolve('./package.json'), { encoding: 'utf8' }));
const external = Object.keys(packages.dependencies).filter(
  name => !name.startsWith('@functionland')
);

build({
  entryPoints: ['src/app.ts'],
  platform: 'node',
  target: 'node14',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/app.js',
  external,
});
