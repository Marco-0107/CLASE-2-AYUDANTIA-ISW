"use strict";
import Joi from "joi";

export const eventoQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
})
  .or("id")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar el id del evento.",
  });

export const eventoBodyValidation = Joi.object({
  titulo: Joi.string()
    .min(5)
    .max(100)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,]+$/)
    .messages({
      "string.empty": "El título no puede estar vacío.",
      "string.base": "El título debe ser de tipo string.",
      "string.min": "El título debe tener como mínimo 5 caracteres.",
      "string.max": "El título debe tener como máximo 100 caracteres.",
      "string.pattern.base": "El título contiene caracteres no permitidos.",
    }),
  descripcion: Joi.string()
    .min(10)
    .max(500)
    .messages({
      "string.empty": "La descripción no puede estar vacía.",
      "string.base": "La descripción debe ser de tipo string.",
      "string.min": "La descripción debe tener como mínimo 10 caracteres.",
      "string.max": "La descripción debe tener como máximo 500 caracteres.",
    }),
  fecha_evento: Joi.date()
    .min('now')
    .messages({
      "date.base": "La fecha del evento debe ser válida.",
      "date.min": "La fecha del evento no puede ser en el pasado.",
    }),
  lugar: Joi.string()
    .min(3)
    .max(200)
    .messages({
      "string.empty": "El lugar no puede estar vacío.",
      "string.base": "El lugar debe ser de tipo string.",
      "string.min": "El lugar debe tener como mínimo 3 caracteres.",
      "string.max": "El lugar debe tener como máximo 200 caracteres.",
    }),
})
  .or("titulo", "descripcion", "fecha_evento", "lugar")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo para actualizar.",
  });
