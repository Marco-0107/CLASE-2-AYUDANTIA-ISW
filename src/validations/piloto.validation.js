"use strict";
import Joi from "joi";

export const pilotoQueryValidation = Joi.object({
  id_piloto: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID debe ser un número",
      "number.integer": "El ID debe ser un número entero",
      "number.positive": "El ID debe ser positivo"
    }),
  rut: Joi.string()
    .min(8)
    .max(15)
    .messages({
      "string.empty": "El RUT no puede estar vacío",
      "string.min": "El RUT debe tener al menos 8 caracteres",
      "string.max": "El RUT debe tener máximo 15 caracteres"
    })
});

export const pilotoBodyValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío",
      "string.min": "El nombre debe tener al menos 2 caracteres",
      "string.max": "El nombre debe tener máximo 100 caracteres",
      "string.pattern.base": "El nombre solo puede contener letras y espacios",
      "any.required": "El nombre es obligatorio"
    }),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El apellido no puede estar vacío",
      "string.min": "El apellido debe tener al menos 2 caracteres",
      "string.max": "El apellido debe tener máximo 100 caracteres",
      "string.pattern.base": "El apellido solo puede contener letras y espacios",
      "any.required": "El apellido es obligatorio"
    }),
  edad: Joi.number()
    .integer()
    .min(18)
    .max(65)
    .required()
    .messages({
      "number.base": "La edad debe ser un número",
      "number.integer": "La edad debe ser un número entero",
      "number.min": "La edad mínima es 18 años",
      "number.max": "La edad máxima es 65 años",
      "any.required": "La edad es obligatoria"
    }),
  nacionalidad: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "La nacionalidad no puede estar vacía",
      "string.min": "La nacionalidad debe tener al menos 2 caracteres",
      "string.max": "La nacionalidad debe tener máximo 50 caracteres",
      "string.pattern.base": "La nacionalidad solo puede contener letras y espacios",
      "any.required": "La nacionalidad es obligatoria"
    }),
  rut: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^[0-9]+[-|‐]{1}[0-9kK]{1}$/)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío",
      "string.min": "El RUT debe tener al menos 8 caracteres",
      "string.max": "El RUT debe tener máximo 15 caracteres",
      "string.pattern.base": "El RUT debe tener un formato válido (ej: 12345678-9)",
      "any.required": "El RUT es obligatorio"
    })
}).options({ 
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
});
