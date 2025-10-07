"use strict";
import {
  getVehiculoService,
  getVehiculosService,
  createVehiculoService,
  updateVehiculoService,
  deleteVehiculoService,
} from "../services/vehiculo.service.js";
import {
  vehiculoQueryValidation,
  vehiculoBodyValidation,
} from "../validations/vehiculo.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

// Obtener vehículo por ID, chassis o marca
export async function getVehiculo(req, res) {
  try {
    const { query } = req;

    const { error } = vehiculoQueryValidation.validate(query);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", error.message);
    }

    const [vehiculo, errorVehiculo] = await getVehiculoService(query);

    if (errorVehiculo) {
      return handleErrorClient(res, 404, "Error al obtener vehículo", errorVehiculo);
    }

    handleSuccess(res, 200, "Vehículo encontrado", vehiculo);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Listar todos los vehículos
export async function getVehiculos(req, res) {
  try {
    const [vehiculos, errorVehiculos] = await getVehiculosService();

    if (errorVehiculos) {
      return handleErrorClient(res, 404, "Error al obtener vehículos", errorVehiculos);
    }

    vehiculos.length === 0
      ? handleSuccess(res, 204, "No hay vehículos registrados")
      : handleSuccess(res, 200, "Vehículos encontrados", vehiculos);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Crear un nuevo vehículo
export async function createVehiculo(req, res) {
  try {
    const { body } = req;

    const { error } = vehiculoBodyValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", error.message);
    }

    const [vehiculo, errorVehiculo] = await createVehiculoService(body);

    if (errorVehiculo) {
      return handleErrorClient(res, 400, "Error al crear vehículo", errorVehiculo);
    }

    handleSuccess(res, 201, "Vehículo creado exitosamente", vehiculo);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Actualizar un vehículo
export async function updateVehiculo(req, res) {
  try {
    const { query, body } = req;

    const { error: queryError } = vehiculoQueryValidation.validate(query);
    if (queryError) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", queryError.message);
    }

    const { error: bodyError } = vehiculoBodyValidation.validate(body);
    if (bodyError) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", bodyError.message);
    }

    const [vehiculo, errorVehiculo] = await updateVehiculoService(query, body);

    if (errorVehiculo) {
      return handleErrorClient(res, 400, "Error al actualizar vehículo", errorVehiculo);
    }

    handleSuccess(res, 200, "Vehículo actualizado exitosamente", vehiculo);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Eliminar un vehículo
export async function deleteVehiculo(req, res) {
  try {
    const { query } = req;

    const { error } = vehiculoQueryValidation.validate(query);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", error.message);
    }

    const [vehiculo, errorVehiculo] = await deleteVehiculoService(query);

    if (errorVehiculo) {
      return handleErrorClient(res, 404, "Error al eliminar vehículo", errorVehiculo);
    }

    handleSuccess(res, 200, "Vehículo eliminado exitosamente", vehiculo);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}
