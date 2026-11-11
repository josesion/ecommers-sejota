import { Router } from "express";
import { method as controladorColores } from "../controladores/colores.controlador";
import { method as permisos } from "../utils/permisos";

const rutas = Router();
const { validarPermiso, soloAdmin } = permisos;

rutas.post("/api/colores", validarPermiso, soloAdmin, controladorColores.altaColores);
rutas.put("/api/colores", validarPermiso, soloAdmin, controladorColores.modColores);
rutas.put("/api/colores/:estado/:id", validarPermiso, soloAdmin, controladorColores.estadoColor);
rutas.get("/api/colores/:estado", validarPermiso, soloAdmin, controladorColores.listaColores);

export default rutas;
