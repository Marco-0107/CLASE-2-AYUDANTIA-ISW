"use strict";
import Joi from "joi";

export const vehiculoQueryValidation = Joi.object({
  id_vehiculo: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID debe ser un número",
      "number.integer": "El ID debe ser un número entero",
      "number.positive": "El ID debe ser positivo"
    }),
  patente: Joi.string()
    .min(6)
    .max(10)
    .messages({
      "string.empty": "La patente no puede estar vacía",
      "string.min": "La patente debe tener al menos 6 caracteres",
      "string.max": "La patente debe tener máximo 10 caracteres"
    }),
  marca: Joi.string()
    .min(2)
    .max(50)
    .messages({
      "string.empty": "La marca no puede estar vacía",
      "string.min": "La marca debe tener al menos 2 caracteres",
      "string.max": "La marca debe tener máximo 50 caracteres"
    })
});

export const vehiculoBodyValidation = Joi.object({
  patente: Joi.string()
    .min(6)
    .max(10)
    .pattern(/^[A-Z0-9\-]+$/)
    .required()
    .messages({
      "string.empty": "La patente no puede estar vacía",
      "string.min": "La patente debe tener al menos 6 caracteres",
      "string.max": "La patente debe tener máximo 10 caracteres",
      "string.pattern.base": "La patente debe contener solo letras mayúsculas, números y guiones",
      "any.required": "La patente es obligatoria"
    }),
  marca: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "La marca no puede estar vacía",
      "string.min": "La marca debe tener al menos 2 caracteres",
      "string.max": "La marca debe tener máximo 50 caracteres",
      "any.required": "La marca es obligatoria"
    }),
  modelo: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.empty": "El modelo no puede estar vacío",
      "string.min": "El modelo debe tener al menos 1 caracter",
      "string.max": "El modelo debe tener máximo 50 caracteres",
      "any.required": "El modelo es obligatorio"
    }),
  año: Joi.number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      "number.base": "El año debe ser un número",
      "number.integer": "El año debe ser un número entero",
      "number.min": "El año debe ser mayor a 1990",
      "number.max": `El año no puede ser mayor a ${new Date().getFullYear() + 1}`,
      "any.required": "El año es obligatorio"
    }),
  id_piloto: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El ID del piloto debe ser un número",
      "number.integer": "El ID del piloto debe ser un número entero",
      "number.positive": "El ID del piloto debe ser positivo"
    })
}).options({ 
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
});
