import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { Buffer } from 'buffer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      hmr: {
        overlay: false
      }
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'sonner']
          }
        },
        external: (id) => {
          // Handle framer-motion external dependencies
          if (id.includes('globalThis-config')) {
            return false;
          }
          return false;
        }
      },
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        include: [/node_modules/]
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'lucide-react',
        'framer-motion > motion-utils'
      ],
      exclude: [
        'redis',
        'ioredis',
        '@langchain/redis'
      ]
    },
    define: {
      global: 'globalThis',
      'process.env': {},
      'Buffer': 'Buffer',
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GOOGLE_API_KEY),
      'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'buffer': 'buffer',
        // Use mock for Redis packages in browser
        '@langchain/redis': path.resolve(__dirname, './src/mocks/langchain-redis.ts'),
      },
    },
  }
})