import { Router } from "express";
import * as ctrl from "../controllers/metas.controller.js";

export const metasRouter = Router();

metasRouter.post("/", ctrl.crear);
metasRouter.get("/:id", ctrl.obtener);
metasRouter.put("/:id", ctrl.actualizar);
metasRouter.patch("/:id/desactivar", ctrl.desactivar);
