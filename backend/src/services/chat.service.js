"use strict";
import { AppDataSource } from "../config/configDb.js";
import MensajeSchema from "../entity/mensaje.entity.js";

/**
 * Guardar un mensaje en la base de datos
 */
export async function saveMensajeService(mensajeData) {
  try {
    const mensajeRepository = AppDataSource.getRepository(MensajeSchema);

    const nuevoMensaje = mensajeRepository.create({
      contenido: mensajeData.contenido,
      tipo_usuario: mensajeData.tipo_usuario,
      id_usuario: mensajeData.id_usuario,
      id_piloto: mensajeData.id_piloto || null,
      leido: false,
      fecha_envio: new Date(),
    });

    await mensajeRepository.save(nuevoMensaje);

    return [nuevoMensaje, null];
  } catch (error) {
    console.error("Error en saveMensajeService:", error);
    return [null, "Error al guardar mensaje"];
  }
}

/**
 * Obtener historial de mensajes entre admin y un piloto (vista admin)
 */
export async function getMensajesService(idUsuarioAdmin, idPiloto) {
  try {
    const mensajeRepository = AppDataSource.getRepository(MensajeSchema);

    const mensajes = await mensajeRepository
      .createQueryBuilder("mensaje")
      .where(
        "(mensaje.id_usuario = :idAdmin AND mensaje.id_piloto = :idPiloto AND mensaje.tipo_usuario = 'admin') OR " +
        "(mensaje.id_usuario = :idPiloto AND mensaje.tipo_usuario = 'piloto')",
        { idAdmin: idUsuarioAdmin, idPiloto }
      )
      .orderBy("mensaje.fecha_envio", "ASC")
      .getMany();

    return [mensajes, null];
  } catch (error) {
    console.error("Error en getMensajesService:", error);
    return [null, "Error al obtener mensajes"];
  }
}

/**
 * Obtener historial de mensajes de un piloto (vista piloto)
 */
export async function getMensajesPilotoService(idPiloto) {
  try {
    const mensajeRepository = AppDataSource.getRepository(MensajeSchema);

    const mensajes = await mensajeRepository
      .createQueryBuilder("mensaje")
      .where(
        "(mensaje.id_piloto = :idPiloto AND mensaje.tipo_usuario = 'admin') OR " +
        "(mensaje.id_usuario = :idPiloto AND mensaje.tipo_usuario = 'piloto')",
        { idPiloto }
      )
      .orderBy("mensaje.fecha_envio", "ASC")
      .getMany();

    return [mensajes, null];
  } catch (error) {
    console.error("Error en getMensajesPilotoService:", error);
    return [null, "Error al obtener mensajes"];
  }
}

/**
 * Obtener lista de conversaciones del admin con pilotos
 */
export async function getConversacionesService(idUsuarioAdmin) {
  try {
    const mensajeRepository = AppDataSource.getRepository(MensajeSchema);

    // Obtener los últimos mensajes agrupados por piloto
    const conversaciones = await mensajeRepository
      .createQueryBuilder("mensaje")
      .select("mensaje.id_piloto", "id_piloto")
      .addSelect("MAX(mensaje.fecha_envio)", "ultima_fecha")
      .addSelect("COUNT(CASE WHEN mensaje.leido = false AND mensaje.tipo_usuario = 'piloto' THEN 1 END)", "mensajes_no_leidos")
      .where("mensaje.id_piloto IS NOT NULL")
      .groupBy("mensaje.id_piloto")
      .orderBy("ultima_fecha", "DESC")
      .getRawMany();

    return [conversaciones, null];
  } catch (error) {
    console.error("Error en getConversacionesService:", error);
    return [null, "Error al obtener conversaciones"];
  }
}

/**
 * Marcar mensajes como leídos
 */
export async function marcarMensajesLeidosService(idPiloto, tipoUsuario) {
  try {
    const mensajeRepository = AppDataSource.getRepository(MensajeSchema);

    await mensajeRepository
      .createQueryBuilder()
      .update()
      .set({ leido: true })
      .where("id_piloto = :idPiloto AND tipo_usuario = :tipoUsuario AND leido = false", {
        idPiloto,
        tipoUsuario: tipoUsuario === "admin" ? "piloto" : "admin",
      })
      .execute();

    return [true, null];
  } catch (error) {
    console.error("Error en marcarMensajesLeidosService:", error);
    return [null, "Error al marcar mensajes como leídos"];
  }
}
