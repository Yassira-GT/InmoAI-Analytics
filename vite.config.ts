
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Esto permite que el código acceda a process.env sin que el navegador falle
    // Vercel inyectará estas variables durante el build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(process.env.REACT_APP_SUPABASE_URL),
    'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(process.env.REACT_APP_SUPABASE_ANON_KEY)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
