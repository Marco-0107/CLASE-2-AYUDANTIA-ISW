"use strict";
import {
  getPilotoService,
  getPilotosService,
  createPilotoService,
  updatePilotoService,
  deletePilotoService,
} from "../services/piloto.service.js";
import {
  pilotoQueryValidation,
  pilotoBodyValidation,
} from "../validations/piloto.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtener piloto por ID, licencia o email
export async function getPiloto(req, res) {
  try {
    const { query } = req;

    const { error } = pilotoQueryValidation.validate(query);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", error.message);
    }

    const [piloto, errorPiloto] = await getPilotoService(query);

    if (errorPiloto) {
      return handleErrorClient(res, 404, "Error al obtener piloto", errorPiloto);
    }

    handleSuccess(res, 200, "Piloto encontrado", piloto);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Listar todos los pilotos
export async function getPilotos(req, res) {
  try {
    const [pilotos, errorPilotos] = await getPilotosService();

    if (errorPilotos) {
      return handleErrorClient(res, 404, "Error al obtener pilotos", errorPilotos);
    }

    pilotos.length === 0
      ? handleSuccess(res, 204, "No hay pilotos registrados")
      : handleSuccess(res, 200, "Pilotos encontrados", pilotos);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Crear un nuevo piloto
export async function createPiloto(req, res) {
  try {
    const { body } = req;

    const { error } = pilotoBodyValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", error.message);
    }

    const [piloto, errorPiloto] = await createPilotoService(body);

    if (errorPiloto) {
      return handleErrorClient(res, 400, "Error al crear piloto", errorPiloto);
    }

    handleSuccess(res, 201, "Piloto creado exitosamente", piloto);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Actualizar un piloto
export async function updatePiloto(req, res) {
  try {
    const { query, body } = req;

    const { error: queryError } = pilotoQueryValidation.validate(query);
    if (queryError) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", queryError.message);
    }

    const { error: bodyError } = pilotoBodyValidation.validate(body);
    if (bodyError) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", bodyError.message);
    }

    const [piloto, errorPiloto] = await updatePilotoService(query, body);

    if (errorPiloto) {
      return handleErrorClient(res, 400, "Error al actualizar piloto", errorPiloto);
    }

    handleSuccess(res, 200, "Piloto actualizado exitosamente", piloto);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Eliminar un piloto
export async function deletePiloto(req, res) {
  try {
    const { query } = req;

    const { error } = pilotoQueryValidation.validate(query);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", error.message);
    }

    const [piloto, errorPiloto] = await deletePilotoService(query);

    if (errorPiloto) {
      return handleErrorClient(res, 404, "Error al eliminar piloto", errorPiloto);
    }

    handleSuccess(res, 200, "Piloto eliminado exitosamente", piloto);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}
