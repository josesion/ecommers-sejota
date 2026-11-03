import { Request, Response } from "express";
import { method as servicioLogin } from "../servicios/login.servicios";
import { tryCatch } from "../utils/tryCatch";
import { MAPA_LOGIN } from "../respuestas/login";
import { LoginInputs } from "../squemas/login";
import { CodigoEstadoHTTP } from "../tipados/generico";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";


/** Nombre de la cookie que transporta el JWT. Debe coincidir con `permisos.ts`. */
const COOKIE_TOKEN = process.env.COOKIE_TOKEN ?? "id_usuario";

/**
 * Reserva para un `code` que no este en el mapa, igual que hace
 * `handleControladores`: mejor un 500 que un 200 con `error: true`.
 */
const ERROR_SERVIDOR: { status: CodigoEstadoHTTP; msg: string } = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
};

/**
 * Autentica un usuario publico. Setea el JWT en la cookie `id_usuario`
 * (httpOnly) y responde solo con los datos publicos.
 *
 * No usa `handleControladores` porque necesita `res.cookie(...)` antes de
 * enviar la respuesta: es el caso de "respuesta condicional" que el
 * contrato de `enviarResponse` contempla como excepcion.
 *
 * @async
 * @function loginUsuario
 * @param {Request} req - Body con `email` y `password`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example POST /api/login { "email": "juan@test.com", "password": "secreto123" }
 */
const loginUsuario = async (req: Request, res: Response) => {
  const dataEntrada: LoginInputs = {
    email: String(req.body?.email ?? ""),
    password: String(req.body?.password ?? ""),
  };

  const resultado = await servicioLogin.login(dataEntrada);
  const config = MAPA_LOGIN[resultado.code] ?? ERROR_SERVIDOR;
  const esExito = config.status >= 200 && config.status < 300;

  console.log(resultado)

  if (!esExito) {
    return enviarResponseError(
      res,
      config.status,
      resultado.message || config.msg,
      resultado.code,
    );
  }

  const datos = resultado.data as NonNullable<typeof resultado.data>;

  const expiracionToken : number = resultado.data?.rol === "admin" 
        ? 60 * 60 * 1000 
        : 7 * 24 * 60 * 60 * 1000

  res.cookie(COOKIE_TOKEN, datos.token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: expiracionToken,
  });

  // El token viaja solo en la cookie, nunca en el body.
  return enviarResponse(
    res, 
    config.status, 
    resultado.message || config.msg, 
    { id: datos.id, rol: datos.rol, email: datos.email},
    undefined,
    resultado.code
  );
};

export const method = {
  login: tryCatch(loginUsuario),
};
