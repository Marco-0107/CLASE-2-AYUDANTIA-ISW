"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
  getPiloto,
  getPilotos,
  createPiloto,
  updatePiloto,
  deletePiloto,
} from "../controllers/piloto.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "organizador", "usuario"), getPilotos)
  .get("/detail/", authorizeRoles("admin", "organizador", "usuario"), getPiloto)
  .post("/", authorizeRoles("admin", "organizador"), createPiloto)
  .patch("/detail/", authorizeRoles("admin", "organizador"), updatePiloto)
  .delete("/detail/", authorizeRoles("admin"), deletePiloto);

export default router;
