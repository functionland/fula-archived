import { defineConfig } from 'vite'
import cdn from './scripts/vite-plugin-cdn.js';

export default defineConfig({
    build: {
        target: 'es2020'
    },
    server: {
        https: true
    }
});
