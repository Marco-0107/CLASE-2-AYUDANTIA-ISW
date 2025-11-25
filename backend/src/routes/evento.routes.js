"use strict";
import { Router } from "express";
import {
  getEvento,
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../controllers/evento.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJwt);

// Rutas de eventos
router.get("/", getEventos);
router.get("/detail/", getEvento);
router.post("/", createEvento);
router.patch("/detail/", updateEvento);
router.delete("/detail/", deleteEvento);

export default router;
