import axios from './root.service.js';

/**
 * Servicio para login de usuario
 * @param {Object} credentials - { email, password }
 * @returns {Promise} Respuesta de la API
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al iniciar sesión'
    };
  }
};

/**
 * Servicio para registro de usuario
 * @param {Object} userData - { nombre, apellido, email, password, rut }
 * @returns {Promise} Respuesta de la API
 */
export const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al registrar usuario'
    };
  }
};

/**
 * Servicio para logout
 * @returns {Promise} Respuesta de la API
 */
export const logout = async () => {
  try {
    await axios.post('/auth/logout');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error al cerrar sesión' 
    };
  }
};