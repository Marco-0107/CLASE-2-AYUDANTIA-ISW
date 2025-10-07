import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  // Extraer la URL base del backend desde VITE_API_URL
  const getBackendUrl = () => {
    if (!env.VITE_API_URL) return null;
    
    // Si la URL termina en /api, quitarlo para obtener la base
    if (env.VITE_API_URL.endsWith('/api')) {
      return env.VITE_API_URL.slice(0, -4);
    }
    
    // Si no termina en /api, usar la URL completa
    return env.VITE_API_URL;
  };

  const backendUrl = getBackendUrl();
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      ...(backendUrl && {
        proxy: {
          '/api': {
            target: backendUrl,
            changeOrigin: true,
            secure: false,
          }
        }
      })
    },
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@context': path.resolve(__dirname, './src/context'),
        '@helpers': path.resolve(__dirname, './src/helpers'),
        '@styles': path.resolve(__dirname, './src/styles')
      }
    },
    // Hacer disponibles las variables de entorno
    define: {
      __VITE_API_URL__: JSON.stringify(env.VITE_API_URL)
    }
  };
});