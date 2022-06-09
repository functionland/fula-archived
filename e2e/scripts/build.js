import { build } from 'esbuild';

await build({
  entryPoints: ['src/fula.test.ts'],
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  outfile: 'dist/node_test.cjs',
  define: {
    global: 'globalThis'
  },
  external: ['@functionland/fula','wrtc']
});

