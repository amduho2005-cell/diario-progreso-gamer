import { Router } from "express";
import * as ctrl from "../controllers/videojuegos.controller.js";

export const videojuegosRouter = Router();

videojuegosRouter.get("/", ctrl.listar);
videojuegosRouter.post("/", ctrl.crear);
videojuegosRouter.get("/:id", ctrl.obtener);
videojuegosRouter.put("/:id", ctrl.actualizar);
videojuegosRouter.delete("/:id", ctrl.eliminar);

// Sub-documentos embebidos: logros
videojuegosRouter.post("/:id/logros", ctrl.agregarLogro);
videojuegosRouter.patch("/:id/logros/:logroId", ctrl.actualizarLogro);
videojuegosRouter.delete("/:id/logros/:logroId", ctrl.eliminarLogro);
