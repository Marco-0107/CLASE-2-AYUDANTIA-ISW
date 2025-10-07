import axios from 'axios';

// Configuración base de axios - COMPLETAMENTE dinámico desde .env
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('❌ VITE_API_URL no está definido en el archivo .env');
  console.error('Por favor agrega: VITE_API_URL=https://tu-backend.com/api');
  throw new Error('URL del backend no configurada');
}

console.log('✅ API URL configurada:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Para incluir cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Si es un error 401 (no autorizado), redirigir al login
    if (error.response?.status === 401) {
      sessionStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;