"use strict";
import { AppDataSource } from "../config/configDb.js";
import Piloto from "../entity/piloto.entity.js";

// Obtener piloto por query (ID o RUT)
export async function getPilotoService(query) {
  try {
    const pilotoRepository = AppDataSource.getRepository(Piloto);
    const { id_piloto, rut } = query;

    const queryBuilder = pilotoRepository.createQueryBuilder("piloto");

    if (id_piloto) {
      queryBuilder.where("piloto.id_piloto = :id_piloto", { id_piloto });
    } else if (rut) {
      queryBuilder.where("piloto.rut = :rut", { rut });
    } else {
      return [null, "Debe proporcionar id_piloto o rut"];
    }

    const piloto = await queryBuilder.getOne();

    if (!piloto) {
      return [null, "Piloto no encontrado"];
    }

    return [piloto, null];
  } catch (error) {
    console.error("Error en getPilotoService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Obtener todos los pilotos
export async function getPilotosService() {
  try {
    const pilotoRepository = AppDataSource.getRepository(Piloto);
    
    const pilotos = await pilotoRepository.find({
      order: { fecha_registro: "DESC" }
    });

    return [pilotos, null];
  } catch (error) {
    console.error("Error en getPilotosService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Crear nuevo piloto
export async function createPilotoService(pilotoData) {
  try {
    const pilotoRepository = AppDataSource.getRepository(Piloto);

    // Verificar si ya existe un piloto con el mismo RUT
    const existingRut = await pilotoRepository.findOne({
      where: { rut: pilotoData.rut }
    });

    if (existingRut) {
      return [null, "Ya existe un piloto con este RUT"];
    }

    const newPiloto = pilotoRepository.create({
      ...pilotoData,
      fecha_registro: new Date()
    });

    await pilotoRepository.save(newPiloto);

    return [newPiloto, null];
  } catch (error) {
    console.error("Error en createPilotoService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Actualizar piloto
export async function updatePilotoService(query, updateData) {
  try {
    const pilotoRepository = AppDataSource.getRepository(Piloto);
    const { id_piloto } = query;

    if (!id_piloto) {
      return [null, "ID del piloto es requerido"];
    }

    const piloto = await pilotoRepository.findOne({
      where: { id_piloto }
    });

    if (!piloto) {
      return [null, "Piloto no encontrado"];
    }

    // Verificar conflicto de RUT solo si se está actualizando
    if (updateData.rut && updateData.rut !== piloto.rut) {
      const existingRut = await pilotoRepository.findOne({
        where: { rut: updateData.rut }
      });

      if (existingRut) {
        return [null, "Ya existe un piloto con este RUT"];
      }
    }

    // Actualizar los datos
    Object.assign(piloto, updateData);

    await pilotoRepository.save(piloto);

    return [piloto, null];
  } catch (error) {
    console.error("Error en updatePilotoService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Eliminar piloto
export async function deletePilotoService(query) {
  try {
    const pilotoRepository = AppDataSource.getRepository(Piloto);
    const { id_piloto } = query;

    if (!id_piloto) {
      return [null, "ID del piloto es requerido"];
    }

    const piloto = await pilotoRepository.findOne({
      where: { id_piloto }
    });

    if (!piloto) {
      return [null, "Piloto no encontrado"];
    }

    await pilotoRepository.remove(piloto);

    return [piloto, null];
  } catch (error) {
    console.error("Error en deletePilotoService:", error);
    return [null, "Error interno del servidor"];
  }
}
