import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { build } from 'esbuild'

build({
    entryPoints: ['src/graph.js'],
    target: 'es2020',
    bundle: true,
    outfile: 'dist/index.js',
    define: {
        global: 'globalThis'
    },
    plugins: [
        NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
            define: { 'process.env.NODE_ENV': '"production"' }, // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
        }),
        NodeModulesPolyfillPlugin()
    ],
})
