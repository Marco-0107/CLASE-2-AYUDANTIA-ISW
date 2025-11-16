"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
  getMensajes,
  getConversaciones,
  marcarMensajesLeidos,
} from "../controllers/chat.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/mensajes", authorizeRoles("admin", "organizador"), getMensajes)
  .get("/conversaciones", authorizeRoles("admin", "organizador"), getConversaciones)
  .post("/marcar-leidos", authorizeRoles("admin", "organizador", "piloto"), marcarMensajesLeidos);

export default router;
