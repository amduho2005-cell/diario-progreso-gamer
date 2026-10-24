import { Router } from "express";
import * as ctrl from "../controllers/videojuegos.controller.js";
import * as partidasCtrl from "../controllers/partidas.controller.js";

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

// Partidas de un juego y su resumen calculado
videojuegosRouter.get("/:id/partidas", partidasCtrl.listarPorVideojuego);
videojuegosRouter.get("/:id/resumen", partidasCtrl.resumen);
