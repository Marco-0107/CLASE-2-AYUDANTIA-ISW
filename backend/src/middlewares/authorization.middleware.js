"use strict";
import { handleErrorClient } from "../handlers/responseHandlers.js";

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return handleErrorClient(
        res,
        401,
        "Usuario no autenticado"
      );
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos suficientes para realizar esta acción",
        { 
          rolRequerido: allowedRoles,
          rolActual: req.user.rol 
        }
      );
    }

    next();
  };
}
