import axios from 'axios';

// Configuración base de axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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