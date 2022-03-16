import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill';
import {NodeModulesPolyfillPlugin} from '@esbuild-plugins/node-modules-polyfill';
import {build} from 'esbuild';
import {clean} from 'build-helpers'

clean()
await build({
    entryPoints: ['src/index.ts'],
    platform: 'browser',
    target: 'es2018',
    format: 'esm',
    bundle: true,
    sourcemap: true,
    outfile: 'dist/web/index.js',
    define: {
        global: 'globalThis'
    },
    plugins: [
        NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
            define: {'process.env.NODE_ENV': '"dev"'} // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
        })
    ]
});


await build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    target: 'node16',
    format: 'cjs',
    bundle: true,
    sourcemap: true,
    outfile: 'dist/node/index.cjs',
    external: ['libp2p-webrtc-star','libp2p-mplex','libp2p','@chainsafe/libp2p-noise']
});






