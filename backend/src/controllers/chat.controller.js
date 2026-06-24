"use strict";
import {
  getMensajesService,
  getMensajesPilotoService,
  getConversacionesService,
  marcarMensajesLeidosService,
} from "../services/chat.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Obtener historial de mensajes entre admin y piloto
 */
export async function getMensajes(req, res) {
  try {
    const { idPiloto } = req.query;

    if (!idPiloto) {
      return handleErrorClient(res, 400, "ID del piloto es requerido");
    }

    // Pilotos ven su propia conversación sin necesitar el id del admin
    if (req.user.rol === "piloto") {
      const [mensajes, error] = await getMensajesPilotoService(idPiloto);
      if (error) return handleErrorClient(res, 404, "Error al obtener mensajes", error);
      return handleSuccess(res, 200, "Mensajes obtenidos", mensajes);
    }

    const idUsuarioAdmin = req.user.id;
    const [mensajes, error] = await getMensajesService(idUsuarioAdmin, idPiloto);

    if (error) {
      return handleErrorClient(res, 404, "Error al obtener mensajes", error);
    }

    handleSuccess(res, 200, "Mensajes obtenidos", mensajes);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

/**
 * Obtener lista de conversaciones del admin
 */
export async function getConversaciones(req, res) {
  try {
    const idUsuarioAdmin = req.user.id; // Del JWT

    const [conversaciones, error] = await getConversacionesService(idUsuarioAdmin);

    if (error) {
      return handleErrorClient(res, 404, "Error al obtener conversaciones", error);
    }

    handleSuccess(res, 200, "Conversaciones obtenidas", conversaciones);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

/**
 * Marcar mensajes como leídos
 */
export async function marcarMensajesLeidos(req, res) {
  try {
    const { idPiloto } = req.body;
    const tipoUsuario = req.user.rol; // Del JWT

    if (!idPiloto) {
      return handleErrorClient(res, 400, "ID del piloto es requerido");
    }

    const [resultado, error] = await marcarMensajesLeidosService(idPiloto, tipoUsuario);

    if (error) {
      return handleErrorClient(res, 400, "Error al marcar mensajes", error);
    }

    handleSuccess(res, 200, "Mensajes marcados como leídos", resultado);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}
