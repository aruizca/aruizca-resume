import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    strictPort: true, // Don't try other ports if 3000 is busy
    open: true,
    watch: {
      // Watch for changes in the core package
      ignored: ['!**/node_modules/**', '!**/packages/core/dist/**'],
    },
  },
  optimizeDeps: {
    // No external dependencies needed for HMR
  },
  define: {
    // Expose API_BASE_URL to the frontend
    __API_BASE_URL__: JSON.stringify(env.API_BASE_URL || 'http://localhost:3001'),
  },
  };
});
