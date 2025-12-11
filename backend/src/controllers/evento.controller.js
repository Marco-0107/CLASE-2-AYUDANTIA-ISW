"use strict";
import {
  getEventoService,
  getEventosService,
  createEventoService,
  updateEventoService,
  deleteEventoService,
} from "../services/evento.service.js";
import {
  eventoQueryValidation,
  eventoBodyValidation,
} from "../validations/evento.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { sendEmail } from "../services/email.service.js";
import { AppDataSource } from "../config/configDb.js";
import UserSchema from "../entity/user.entity.js";

// Función para enviar notificación de nuevo evento a todos los usuarios
const enviarNotificacionEvento = async (evento) => {
  try {
    // Obtener todos los usuarios de la base de datos
    const userRepository = AppDataSource.getRepository("User");
    const usuarios = await userRepository.find({
      select: ["email"],
    });

    if (!usuarios || usuarios.length === 0) {
      console.log("⚠️ No hay usuarios para notificar");
      return;
    }

    // Formatear la fecha del evento
    const fechaEvento = new Date(evento.fecha_evento);
    const fechaFormateada = fechaEvento.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `🏁 Nuevo Evento de Rally - ${evento.titulo}`;
    
    const mensaje = `Se ha creado un nuevo evento de rally.

🏁 EVENTO: ${evento.titulo}

📍 Lugar: ${evento.lugar}
📅 Fecha: ${fechaFormateada}
📝 Descripción: ${evento.descripcion}

¡No te lo pierdas!

Atentamente,
Equipo de Rally`;

    // Enviar email a cada usuario
    const promesasEmail = usuarios.map(async (usuario) => {
      if (usuario.email) {
        try {
          await sendEmail(
            usuario.email,
            subject,
            mensaje,
            `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ff6b00, #ff8c00); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🏁 Nuevo Evento de Rally</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sistema de Rally</p>
              </div>
              
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #ff6b00; margin-top: 0; font-size: 24px;">
                  ${evento.titulo}
                </h2>
                
                <div style="background-color: #fff3e0; border-left: 4px solid #ff6b00; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0 0 10px 0; color: #333; font-size: 15px;">
                    <strong>📍 Lugar:</strong> ${evento.lugar}
                  </p>
                  <p style="margin: 0 0 10px 0; color: #333; font-size: 15px;">
                    <strong>📅 Fecha:</strong> ${fechaFormateada}
                  </p>
                  <p style="margin: 0; color: #333; font-size: 15px;">
                    <strong>📝 Descripción:</strong>
                  </p>
                  <p style="margin: 10px 0 0 0; color: #555; font-size: 14px; line-height: 1.6;">
                    ${evento.descripcion}
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    Atentamente,<br>
                    <strong>Equipo de Rally</strong>
                  </p>
                  <p style="color: #666; font-size: 11px; margin: 10px 0 0 0;">
                    Este correo fue enviado automáticamente por el sistema de gestión de Rally.
                  </p>
                </div>
              </div>
            </div>`
          );
          console.log(`✅ Email de evento enviado a: ${usuario.email}`);
        } catch (emailError) {
          console.error(`❌ Error enviando email a ${usuario.email}:`, emailError.message);
        }
      }
    });

    // Esperar a que se envíen todos los emails
    await Promise.allSettled(promesasEmail);
    console.log(`📧 Notificaciones de evento enviadas a ${usuarios.length} usuarios`);
    
  } catch (error) {
    console.error("Error al enviar notificaciones de evento:", error.message);
  }
};

// Obtener evento por ID
export async function getEvento(req, res) {
  try {
    const { query } = req;

    const { error } = eventoQueryValidation.validate(query);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", error.message);
    }

    const [evento, errorEvento] = await getEventoService(query);

    if (errorEvento) {
      return handleErrorClient(res, 404, "Error al obtener evento", errorEvento);
    }

    handleSuccess(res, 200, "Evento encontrado", evento);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Listar todos los eventos
export async function getEventos(req, res) {
  try {
    const [eventos, errorEventos] = await getEventosService();

    if (errorEventos) {
      return handleErrorClient(res, 404, "Error al obtener eventos", errorEventos);
    }

    eventos.length === 0
      ? handleSuccess(res, 204, "No hay eventos registrados")
      : handleSuccess(res, 200, "Eventos encontrados", eventos);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Crear un nuevo evento
export async function createEvento(req, res) {
  try {
    const { body } = req;

    const { error } = eventoBodyValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", error.message);
    }

    const [evento, errorEvento] = await createEventoService(body);

    if (errorEvento) {
      return handleErrorClient(res, 400, "Error al crear evento", errorEvento);
    }

    // Enviar notificaciones por email de forma asíncrona (no bloquea la respuesta)
    setTimeout(() => {
      enviarNotificacionEvento(evento).catch(err => {
        console.error("Error en notificación de evento:", err);
      });
    }, 100);

    handleSuccess(res, 201, "Evento creado exitosamente", evento);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Actualizar un evento
export async function updateEvento(req, res) {
  try {
    const { query, body } = req;

    const { error: queryError } = eventoQueryValidation.validate(query);
    if (queryError) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", queryError.message);
    }

    const { error: bodyError } = eventoBodyValidation.validate(body);
    if (bodyError) {
      return handleErrorClient(res, 400, "Datos de entrada inválidos", bodyError.message);
    }

    const [evento, errorEvento] = await updateEventoService(query, body);

    if (errorEvento) {
      return handleErrorClient(res, 400, "Error al actualizar evento", errorEvento);
    }

    handleSuccess(res, 200, "Evento actualizado exitosamente", evento);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

// Eliminar un evento
export async function deleteEvento(req, res) {
  try {
    const { query } = req;

    const { error } = eventoQueryValidation.validate(query);
    if (error) {
      return handleErrorClient(res, 400, "Parámetros de consulta inválidos", error.message);
    }

    const [evento, errorEvento] = await deleteEventoService(query);

    if (errorEvento) {
      return handleErrorClient(res, 404, "Error al eliminar evento", errorEvento);
    }

    handleSuccess(res, 200, "Evento eliminado exitosamente", evento);
  } catch (error) {
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}
