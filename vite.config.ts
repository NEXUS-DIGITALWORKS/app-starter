import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    setupFiles: ['./src/test/setupRegistryFixture.ts'],
    // worker/ は独立npmパッケージで自前のvitest.config.tsを持つ（cd worker && npm test）。
    // デフォルトのincludeはnode_modules以外を再帰的に拾うため、明示的に除外する。
    exclude: ['**/node_modules/**', 'worker/**'],
  },
});
