"use strict";
import { Router } from "express";

// Importación de rutas
import authRoutes from "./auth.routes.js";
import pilotoRoutes from "./piloto.routes.js";
import vehiculoRoutes from "./vehiculo.routes.js";
import chatRoutes from "./chat.routes.js";
import eventoRoutes from "./evento.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/pilotos", pilotoRoutes)
  .use("/vehiculos", vehiculoRoutes)
  .use("/chat", chatRoutes)
  .use("/eventos", eventoRoutes);

export default router;
