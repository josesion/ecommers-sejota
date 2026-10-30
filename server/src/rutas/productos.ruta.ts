import { Router } from "express";
import { method as controladorProductos } from "../controladores/productos.controlador";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.get("/api/productos", permisos.validarPermiso, permisos.soloAdmin, controladorProductos.listar);
rutas.post("/api/productos", permisos.validarPermiso, permisos.soloAdmin, controladorProductos.crear);
rutas.put("/api/productos", permisos.validarPermiso, permisos.soloAdmin, controladorProductos.modificar);
rutas.delete("/api/productos", permisos.validarPermiso, permisos.soloAdmin, controladorProductos.baja);

export default rutas;
