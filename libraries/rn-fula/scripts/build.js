import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { build } from 'esbuild';
import path from 'path';
import ignorePlugin from "esbuild-plugin-ignore";

build({
  entryPoints: ['src/rn-client/index.ts'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/rn/index.js',
  external:["expo-file-system",'react','react-native','react-native-webview']
});

build({
  entryPoints: ['src/webview-fula/index.ts'],
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  outfile: 'dist/browser/index.js',
  define: {
    global: 'globalThis'
  },
  inject: [path.resolve('scripts/node-globals.js')],
  plugins: [
    ignorePlugin([
      {
        resourceRegExp: /react|react-native|react-native-webview|expo-file-system$/
      }
    ]),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: false,
      define: { 'process.env.NODE_ENV': '"production"' } // inject will override define, to keep env vars you must also pass define here https://github.com/evanw/esbuild/issues/660
    })
  ],
  external:["expo-file-system",'react','react-native','react-native-webview']
});
