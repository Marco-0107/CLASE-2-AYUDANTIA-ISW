"use strict";
import Joi from "joi";

export const authValidation = Joi.object({
  email: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Verificar si es un email válido
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Verificar si es un RUT válido (formato: 12345678-9 o 12.345.678-9)
      const rutPattern = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
      
      if (emailPattern.test(value) || rutPattern.test(value)) {
        return value;
      }
      
      return helpers.error('any.invalid');
    })
    .messages({
      "string.empty": "El email o RUT no puede estar vacío.",
      "any.required": "El email o RUT es obligatorio.",
      "any.invalid": "Debe ingresar un email válido o un RUT en formato 12345678-9",
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^[a-zA-Z0-9]+$/)
    .allow('')
    .optional()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 50 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "any.required": "El nombre es obligatorio.",
      "string.base": "El nombre debe ser de tipo texto.",
      "string.min": "El nombre debe tener al menos 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El apellido no puede estar vacío.",
      "any.required": "El apellido es obligatorio.",
      "string.base": "El apellido debe ser de tipo texto.",
      "string.min": "El apellido debe tener al menos 2 caracteres.",
      "string.max": "El apellido debe tener como máximo 100 caracteres.",
      "string.pattern.base": "El apellido solo puede contener letras y espacios.",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El email no puede estar vacío.",
      "any.required": "El email es obligatorio.",
      "string.email": "El email debe tener un formato válido.",
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 50 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números.",
    }),
})
  .unknown(false)
  .messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});
