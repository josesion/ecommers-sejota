import { Router } from "express";
import { method as controladorCategorias } from "../controladores/categorias.controlador";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.get("/api/categorias", permisos.validarPermiso, permisos.soloAdmin, controladorCategorias.listar);
rutas.post("/api/categorias", permisos.validarPermiso, permisos.soloAdmin, controladorCategorias.crear);
rutas.put("/api/categorias", permisos.validarPermiso, permisos.soloAdmin, controladorCategorias.modificar);
rutas.put("/api/categorias_estado", permisos.validarPermiso, permisos.soloAdmin, controladorCategorias.baja);

export default rutas;
