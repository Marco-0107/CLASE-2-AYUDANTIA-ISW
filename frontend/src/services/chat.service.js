import axios from './root.service.js';

/**
 * Obtener historial de mensajes con un piloto
 */
export const getMensajes = async (idPiloto) => {
  try {
    const response = await axios.get(`/chat/mensajes?idPiloto=${idPiloto}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener mensajes',
      data: []
    };
  }
};

/**
 * Obtener lista de conversaciones
 */
export const getConversaciones = async () => {
  try {
    const response = await axios.get('/chat/conversaciones');
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener conversaciones',
      data: []
    };
  }
};

/**
 * Marcar mensajes como leídos
 */
export const marcarMensajesLeidos = async (idPiloto) => {
  try {
    const response = await axios.post('/chat/marcar-leidos', { idPiloto });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error al marcar mensajes:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al marcar mensajes'
    };
  }
};
