import { Request, Response, NextFunction } from "express";
import { verificarToken } from "./jwt";
import { enviarResponseError } from "./responseError";
import { CodigoEstadoHTTP } from "../tipados/generico";

/**
 * Datos de sesion que el token de auth inyecta en `req.usuario`.
 * Los controladores leen la identidad desde aca, nunca desde el body.
 */
export interface UsuarioSesion {
  id: number;
  rol: string;
  email: string;
}

/** Nombre de la cookie que transporta el JWT. Configurable por entorno. */
const COOKIE_TOKEN = process.env.COOKIE_TOKEN ?? "id_usuario";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioSesion;
    }
  }
}

/**
 * Middleware de autenticacion. Valida el JWT de la cookie y lo inyecta en
 * `req.usuario`. Es el segundo middleware de toda ruta protegida
 * (ver `RUTAS.md` regla 2); va justo despues del path.
 *
 * @async
 * @function validarPermiso
 * @param {Request} req - Peticion con la cookie del token.
 * @param {Response} res - Respuesta HTTP.
 * @param {NextFunction} next - Continua al controlador.
 * @returns {Promise<void>}
 * @example
 * rutas.get(
 *   "/api/usuarios",
 *   permisos.validarPermiso,
 *   controladorUsuarios.listado,
 * );
 */
export const validarPermiso = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.[COOKIE_TOKEN];

  if (!token) {
    return enviarResponseError(
      res,
      CodigoEstadoHTTP.NO_AUTORIZADO,
      "No se encontro un token de sesion.",
      "TOKEN_AUSENTE",
    );
  }

  try {
    const payload = verificarToken(token) as UsuarioSesion;

    req.usuario = {
      id: Number(payload.id),
      rol: payload.rol,
      email: payload.email,
    };

    return next();
  } catch {
    return enviarResponseError(
      res,
      CodigoEstadoHTTP.NO_AUTORIZADO,
      "El token de sesion es invalido o expiro.",
      "TOKEN_INVALIDO",
    );
  }
};

/**
 * Middleware de autorizacion por rol. Exige que el usuario de la sesion
 * sea administrador. Va siempre DESPUES de `validarPermiso`, porque
 * necesita `req.usuario` ya inyectado por ese middleware.
 *
 * @async
 * @function soloAdmin
 * @param {Request} req - Peticion con `req.usuario` ya cargado.
 * @param {Response} res - Respuesta HTTP.
 * @param {NextFunction} next - Continua al controlador.
 * @returns {Promise<void>}
 * @example
 * rutas.get(
 *   "/api/usuarios",
 *   permisos.validarPermiso,
 *   permisos.soloAdmin,
 *   controladorUsuarios.listado,
 * );
 */
export const soloAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  if (req.usuario?.rol !== "admin") {
    return enviarResponseError(
      res,
      CodigoEstadoHTTP.PROHIBIDO,
      "Se requiere rol de administrador.",
      "ROL_INSUFICIENTE",
    );
  }
  return next();
};

export const method = {
  validarPermiso,
  soloAdmin,
};
