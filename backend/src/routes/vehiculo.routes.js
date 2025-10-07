"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import {
  getVehiculo,
  getVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from "../controllers/vehiculo.controller.js";

const router = Router();

router.use(authenticateJwt);

router
  .get("/", authorizeRoles("admin", "organizador", "usuario"), getVehiculos)
  .get("/detail/", authorizeRoles("admin", "organizador", "usuario"), getVehiculo)
  .post("/", authorizeRoles("admin", "organizador"), createVehiculo)
  .patch("/detail/", authorizeRoles("admin", "organizador"), updateVehiculo)
  .delete("/detail/", authorizeRoles("admin"), deleteVehiculo);

export default router;
