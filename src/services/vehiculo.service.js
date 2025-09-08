"use strict";
import { AppDataSource } from "../config/configDb.js";
import Vehiculo from "../entity/vehiculo.entity.js";
import Piloto from "../entity/piloto.entity.js";

// Obtener vehículo por query (ID, patente o marca)
export async function getVehiculoService(query) {
  try {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const { id_vehiculo, patente, marca } = query;

    const queryBuilder = vehiculoRepository.createQueryBuilder("vehiculo")
      .leftJoinAndSelect("vehiculo.piloto", "piloto");

    if (id_vehiculo) {
      queryBuilder.where("vehiculo.id_vehiculo = :id_vehiculo", { id_vehiculo });
    } else if (patente) {
      queryBuilder.where("vehiculo.patente = :patente", { patente });
    } else if (marca) {
      queryBuilder.where("vehiculo.marca = :marca", { marca });
    } else {
      return [null, "Debe proporcionar id_vehiculo, patente o marca"];
    }

    const vehiculo = await queryBuilder.getOne();

    if (!vehiculo) {
      return [null, "Vehículo no encontrado"];
    }

    return [vehiculo, null];
  } catch (error) {
    console.error("Error en getVehiculoService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Obtener todos los vehículos
export async function getVehiculosService() {
  try {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    
    const vehiculos = await vehiculoRepository.find({
      relations: ["piloto"],
      order: { fecha_registro: "DESC" }
    });

    return [vehiculos, null];
  } catch (error) {
    console.error("Error en getVehiculosService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Crear nuevo vehículo
export async function createVehiculoService(vehiculoData) {
  try {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const pilotoRepository = AppDataSource.getRepository(Piloto);

    // Verificar si ya existe un vehículo con la misma patente
    const existingPatente = await vehiculoRepository.findOne({
      where: { patente: vehiculoData.patente }
    });

    if (existingPatente) {
      return [null, "Ya existe un vehículo con esta patente"];
    }

    // Verificar si el piloto existe (si se proporciona)
    if (vehiculoData.id_piloto) {
      const piloto = await pilotoRepository.findOne({
        where: { id_piloto: vehiculoData.id_piloto }
      });

      if (!piloto) {
        return [null, "El piloto especificado no existe"];
      }
    }

    const newVehiculo = vehiculoRepository.create({
      ...vehiculoData,
      fecha_registro: new Date()
    });

    await vehiculoRepository.save(newVehiculo);

    // Obtener el vehículo con la relación del piloto
    const vehiculoConPiloto = await vehiculoRepository.findOne({
      where: { id_vehiculo: newVehiculo.id_vehiculo },
      relations: ["piloto"]
    });

    return [vehiculoConPiloto, null];
  } catch (error) {
    console.error("Error en createVehiculoService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Actualizar vehículo
export async function updateVehiculoService(query, updateData) {
  try {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const pilotoRepository = AppDataSource.getRepository(Piloto);
    const { id_vehiculo } = query;

    if (!id_vehiculo) {
      return [null, "ID del vehículo es requerido"];
    }

    const vehiculo = await vehiculoRepository.findOne({
      where: { id_vehiculo },
      relations: ["piloto"]
    });

    if (!vehiculo) {
      return [null, "Vehículo no encontrado"];
    }

    // Verificar conflicto de patente solo si se está actualizando
    if (updateData.patente && updateData.patente !== vehiculo.patente) {
      const existingPatente = await vehiculoRepository.findOne({
        where: { patente: updateData.patente }
      });

      if (existingPatente) {
        return [null, "Ya existe un vehículo con esta patente"];
      }
    }

    // Verificar si el nuevo piloto existe (si se proporciona)
    if (updateData.id_piloto !== undefined) {
      if (updateData.id_piloto !== null) {
        const piloto = await pilotoRepository.findOne({
          where: { id_piloto: updateData.id_piloto }
        });

        if (!piloto) {
          return [null, "El piloto especificado no existe"];
        }
      }
    }

    // Actualizar los datos
    Object.assign(vehiculo, updateData);

    await vehiculoRepository.save(vehiculo);

    // Obtener el vehículo actualizado con la relación del piloto
    const vehiculoActualizado = await vehiculoRepository.findOne({
      where: { id_vehiculo },
      relations: ["piloto"]
    });

    return [vehiculoActualizado, null];
  } catch (error) {
    console.error("Error en updateVehiculoService:", error);
    return [null, "Error interno del servidor"];
  }
}

// Eliminar vehículo
export async function deleteVehiculoService(query) {
  try {
    const vehiculoRepository = AppDataSource.getRepository(Vehiculo);
    const { id_vehiculo } = query;

    if (!id_vehiculo) {
      return [null, "ID del vehículo es requerido"];
    }

    const vehiculo = await vehiculoRepository.findOne({
      where: { id_vehiculo },
      relations: ["piloto"]
    });

    if (!vehiculo) {
      return [null, "Vehículo no encontrado"];
    }

    await vehiculoRepository.remove(vehiculo);

    return [vehiculo, null];
  } catch (error) {
    console.error("Error en deleteVehiculoService:", error);
    return [null, "Error interno del servidor"];
  }
}
