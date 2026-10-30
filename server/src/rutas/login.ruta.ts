import { Router } from "express";
import { method as controladorLogin } from "../controladores/login.controlador";

const rutas = Router();

// Ruta publica: es la puerta de entrada para obtener el token.
// No lleva `permisos.validarPermiso` a proposito.
rutas.post("/api/login", controladorLogin.login);

export default rutas;
