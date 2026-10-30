import { Request, Response } from "express";
import { method as servicioUsuarios } from "../servicios/usuarios.servicios";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import {
  MAPA_USUARIOS_BAJA,
  MAPA_USUARIOS_CREAR,
  MAPA_USUARIOS_LISTAR,
  MAPA_USUARIOS_MODIFICAR,
} from "../respuestas/usuarios";
import {
  UsuariosActualizarInputs,
  UsuariosBajaInputs,
  UsuariosCrearInputs,
  UsuariosListadoInputs,
} from "../squemas/usuarios";
import { UsuarioCreado, UsuarioListado } from "../tipados/usuarios";

/**
 * Arma el payload de listado desde el query string.
 * Todo numero se castea con `Number()` antes de entrar al servicio.
 */
const armarFiltrosListado = (req: Request): UsuariosListadoInputs => ({
  pagina: Number(req.query.pagina ?? 1),
  limite: Number(req.query.limite ?? 10),
  busqueda: req.query.busqueda ? String(req.query.busqueda) : undefined,
  rol: req.query.rol === "admin" || req.query.rol === "cliente" ? req.query.rol : undefined,
});

/**
 * Lista usuarios con paginacion.
 *
 * @async
 * @function listarUsuarios
 * @param {Request} req - Query con `pagina`, `limite`, `busqueda` y `rol`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example GET /api/usuarios?pagina=1&limite=10
 */
const listarUsuarios = async (req: Request, res: Response) => {
  const dataListado = armarFiltrosListado(req);

  await handleControladores<UsuariosListadoInputs, UsuarioListado[]>(
    res,
    dataListado,
    servicioUsuarios.listar,
    MAPA_USUARIOS_LISTAR,
  );
};

/**
 * Crea un usuario.
 *
 * @async
 * @function crearUsuario
 * @param {Request} req - Body con nombre, apellido, email, password y rol opcional.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example POST /api/usuarios { "nombre": "Juan", "apellido": "Perez", "email": "juan@test.com", "password": "secreto123" }
 */
const crearUsuario = async (req: Request, res: Response) => {
  const dataEntrada: UsuariosCrearInputs = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    password: req.body.password,
    telefono: req.body.telefono ?? null,
    rol: req.body.rol ?? "cliente",
  };

  await handleControladores<UsuariosCrearInputs, UsuarioCreado>(
    res,
    dataEntrada,
    servicioUsuarios.crear,
    MAPA_USUARIOS_CREAR,
  );
};

/**
 * Modifica un usuario.
 *
 * @async
 * @function modificarUsuario
 * @param {Request} req - Body con `id_usuario` y los campos a cambiar.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example PUT /api/usuarios { "id_usuario": 1, "nombre": "Juan Carlos" }
 */
const modificarUsuario = async (req: Request, res: Response) => {
  const dataEntrada: UsuariosActualizarInputs = {
    id_usuario: Number(req.body.id_usuario),
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    telefono: req.body.telefono,
    rol: req.body.rol,
  };

  await handleControladores<UsuariosActualizarInputs, unknown>(
    res,
    dataEntrada,
    servicioUsuarios.modificar,
    MAPA_USUARIOS_MODIFICAR,
  );
};

/**
 * Da de baja logica a un usuario.
 *
 * @async
 * @function bajaUsuario
 * @param {Request} req - Body con `id_usuario`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example DELETE /api/usuarios { "id_usuario": 1 }
 */
const bajaUsuario = async (req: Request, res: Response) => {
  const dataEntrada: UsuariosBajaInputs = {
    id_usuario: Number(req.body.id_usuario),
  };

  await handleControladores<UsuariosBajaInputs, { id_usuario: number }>(
    res,
    dataEntrada,
    servicioUsuarios.baja,
    MAPA_USUARIOS_BAJA,
  );
};

export const method = {
  listar: tryCatch(listarUsuarios),
  crear: tryCatch(crearUsuario),
  modificar: tryCatch(modificarUsuario),
  baja: tryCatch(bajaUsuario),
};
