import { Router } from "express";
import { method as controladorTalles } from "../controladores/talles.controlador";
import { method as permisos } from "../utils/permisos";

const rutas = Router();
const { validarPermiso, soloAdmin } = permisos;    

 rutas.post("/api/talles",validarPermiso, soloAdmin, controladorTalles.altaTalles);
 rutas.put("/api/talles/nombres", validarPermiso, validarPermiso, controladorTalles.modTallesNombre);
 rutas.put("/api/talles/:estado/:id", validarPermiso, soloAdmin, controladorTalles.estadoTalle)
 rutas.get("/api/talles/:estado", validarPermiso, controladorTalles.listaTalles); 
 rutas.put("/api/talles/orden", validarPermiso, soloAdmin, controladorTalles.modOrdenTalles);  
 
export default rutas;