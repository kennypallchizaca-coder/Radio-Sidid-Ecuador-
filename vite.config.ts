import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@radix-ui/react-icons'],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    assetsInlineLimit: 4096, // 4kb
  },
})
