import {build} from 'esbuild'
import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'

build({
  entryPoints: ['src/index.ts'],
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  plugins:[{
    name: 'Import Meta',
    setup(build) {
      build.onLoad({filter: /default-ssdp-options.js$/}, async args => {
        let contents = await readFile(args.path, 'utf8');
        contents = contents.replace(
          /\bimport\.meta\.url\b/g,
          "require(\"url\").pathToFileURL(__filename).toString().replace('/dist/index.js','/node_modules/@achingbrain/ssdp/dist/src/')",
        );
        return { contents, loader: 'default' }
      });
    },
  }],
  external:['wrtc','config','default-gateway','leveldown','ipfs-utils']
})
