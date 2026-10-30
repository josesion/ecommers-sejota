import { Router } from "express";
import { method as controladorUsuarios } from "../controladores/usuarios.controlador";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.get("/api/usuarios", permisos.validarPermiso, permisos.soloAdmin, controladorUsuarios.listar);
rutas.post("/api/usuarios", permisos.validarPermiso, permisos.soloAdmin, controladorUsuarios.crear);
rutas.put("/api/usuarios", permisos.validarPermiso, permisos.soloAdmin, controladorUsuarios.modificar);
rutas.delete("/api/usuarios", permisos.validarPermiso, permisos.soloAdmin, controladorUsuarios.baja);

export default rutas;
