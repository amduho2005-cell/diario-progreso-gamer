import { Router } from "express";
import * as ctrl from "../controllers/partidas.controller.js";

export const partidasRouter = Router();

partidasRouter.get("/", ctrl.listar);
partidasRouter.post("/", ctrl.crear);
partidasRouter.get("/:id", ctrl.obtener);
partidasRouter.put("/:id", ctrl.actualizar);
partidasRouter.delete("/:id", ctrl.eliminar);
