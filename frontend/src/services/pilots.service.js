import axios from './root.service.js';

/**
 * Obtiene todos los pilotos
 * @returns {Promise} Lista de pilotos
 */
export const getPilotos = async () => {
  try {
    const response = await axios.get('/pilotos');
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error al obtener pilotos:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener pilotos',
      data: []
    };
  }
};

/**
 * Obtener un piloto por ID
 * @param {number} id - ID del piloto
 * @returns {Promise} Datos del piloto
 */
export const getPiloto = async (id) => {
  try {
    const response = await axios.get(`/pilotos/detail/?id=${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener piloto'
    };
  }
};

/**
 * Crear un nuevo piloto
 * @param {Object} pilotoData - Datos del piloto
 * @returns {Promise} Piloto creado
 */
export const createPiloto = async (pilotoData) => {
  try {
    const response = await axios.post('/pilotos', pilotoData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al crear piloto'
    };
  }
};

/**
 * Actualizar un piloto
 * @param {number} id - ID del piloto
 * @param {Object} pilotoData - Datos actualizados
 * @returns {Promise} Piloto actualizado
 */
export const updatePiloto = async (id, pilotoData) => {
  try {
    const response = await axios.patch(`/pilotos/detail/?id=${id}`, pilotoData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al actualizar piloto'
    };
  }
};

/**
 * Eliminar un piloto
 * @param {number} id - ID del piloto
 * @returns {Promise} Confirmación
 */
export const deletePiloto = async (id) => {
  try {
    const response = await axios.delete(`/pilotos/detail/?id=${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al eliminar piloto'
    };
  }
};