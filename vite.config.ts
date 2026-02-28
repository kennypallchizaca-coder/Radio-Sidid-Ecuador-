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
          'vendor-core': ['react', 'react-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-three': ['three', '@react-three/fiber'],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    assetsInlineLimit: 4096, // 4kb
  },
})
