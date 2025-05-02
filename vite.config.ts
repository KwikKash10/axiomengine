import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://ccbvfyyxdlojebatfupf.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYnZmeXl4ZGxvamViYXRmdXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ1MDEwNDcsImV4cCI6MjAwMDA3NzA0N30.Fjp6KArBD_kVLkOeXzG24nTYLnYZQHE8S-Qfweb8v5k',
      VITE_APP_NAME: process.env.VITE_APP_NAME || 'AxiomEngine',
      VITE_APP_URL: process.env.VITE_APP_URL || 'https://axiomengine.getino.app'
    }
  }
}) 