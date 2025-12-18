import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 400,
      rollupOptions: {
        input: {
          main: './index.html'
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor_lucide';
              if (id.includes('react')) return 'vendor_react';
              if (id.includes('@google/genai')) return 'vendor_genai';
              return 'vendor';
            }
          }
        }
      }
    }
  };
});