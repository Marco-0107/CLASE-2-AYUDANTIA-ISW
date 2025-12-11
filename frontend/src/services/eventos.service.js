import axios from './root.service.js';

export const getEventos = async () => {
  try {
    const { data } = await axios.get('/eventos/');
    return data.data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    throw error;
  }
};

export const getEvento = async (id) => {
  try {
    const { data } = await axios.get(`/eventos/detail/?id=${id}`);
    return data.data;
  } catch (error) {
    console.error('Error al obtener evento:', error);
    throw error;
  }
};

export const createEvento = async (eventoData) => {
  try {
    const { data } = await axios.post('/eventos/', eventoData);
    return data.data;
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw error;
  }
};

export const updateEvento = async (id, eventoData) => {
  try {
    const { data } = await axios.patch(`/eventos/detail/?id=${id}`, eventoData);
    return data.data;
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    throw error;
  }
};

export const deleteEvento = async (id) => {
  try {
    const { data } = await axios.delete(`/eventos/detail/?id=${id}`);
    return data.data;
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    throw error;
  }
};
