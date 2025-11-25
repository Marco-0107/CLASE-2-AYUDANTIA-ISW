"use strict";
import EventoSchema from "../entity/evento.entity.js";
import { AppDataSource } from "../config/configDb.js";

// Obtener evento por ID
export async function getEventoService(query) {
  try {
    const { id } = query;

    const eventoRepository = AppDataSource.getRepository("Evento");

    const evento = await eventoRepository.findOne({
      where: { id },
    });

    if (!evento) return [null, "Evento no encontrado"];

    return [evento, null];
  } catch (error) {
    console.error("Error al obtener el evento:", error);
    return [null, "Error interno del servidor"];
  }
}

// Obtener todos los eventos
export async function getEventosService() {
  try {
    const eventoRepository = AppDataSource.getRepository("Evento");

    const eventos = await eventoRepository.find({
      order: {
        fecha_evento: "ASC",
      },
    });

    if (!eventos || eventos.length === 0) return [null, "No hay eventos"];

    return [eventos, null];
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return [null, "Error interno del servidor"];
  }
}

// Crear un nuevo evento
export async function createEventoService(body) {
  try {
    const eventoRepository = AppDataSource.getRepository("Evento");

    const nuevoEvento = eventoRepository.create({
      titulo: body.titulo,
      descripcion: body.descripcion,
      fecha_evento: body.fecha_evento,
      lugar: body.lugar,
    });

    const eventoGuardado = await eventoRepository.save(nuevoEvento);

    return [eventoGuardado, null];
  } catch (error) {
    console.error("Error al crear el evento:", error);
    return [null, "Error interno del servidor"];
  }
}

// Actualizar un evento
export async function updateEventoService(query, body) {
  try {
    const { id } = query;

    const eventoRepository = AppDataSource.getRepository("Evento");

    const evento = await eventoRepository.findOne({
      where: { id },
    });

    if (!evento) return [null, "Evento no encontrado"];

    const dataToUpdate = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      fecha_evento: body.fecha_evento,
      lugar: body.lugar,
    };

    await eventoRepository.update({ id }, dataToUpdate);

    const eventoActualizado = await eventoRepository.findOne({
      where: { id },
    });

    return [eventoActualizado, null];
  } catch (error) {
    console.error("Error al actualizar el evento:", error);
    return [null, "Error interno del servidor"];
  }
}

// Eliminar un evento
export async function deleteEventoService(query) {
  try {
    const { id } = query;

    const eventoRepository = AppDataSource.getRepository("Evento");

    const evento = await eventoRepository.findOne({
      where: { id },
    });

    if (!evento) return [null, "Evento no encontrado"];

    await eventoRepository.remove(evento);

    return [evento, null];
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    return [null, "Error interno del servidor"];
  }
}
