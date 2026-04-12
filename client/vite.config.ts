import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@data-drop/api-schema': resolve(__dirname, '../packages/api-schema/src/index.ts'),
    },
  },
  server: {
    port: 8080,
    strictPort: true,
  },
});
