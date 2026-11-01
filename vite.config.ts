import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      build: {
        outDir: 'dist',
        sourcemap: mode !== 'production',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            // Keep Supabase out of the entry chunk; only /verify needs it.
            manualChunks: (id) => (id.includes('node_modules/@supabase/') ? 'supabase' : undefined),
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
