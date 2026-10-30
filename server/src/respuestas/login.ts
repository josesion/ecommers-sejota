import { CodigoEstadoHTTP } from "../tipados/generico";

/** Entrada de reserva obligatoria en todo mapa. */
const ERROR_SERVIDOR = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
} as const;

/**
 * Mapa de codigos del login. Un `code` sin entrada cae en 500 via el
 * `ERROR_SERVIDOR` de reserva de `handleControladores`.
 */
export const MAPA_LOGIN: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  LOGIN_OK: { status: CodigoEstadoHTTP.OK, msg: "Inicio de sesion exitoso" },
  CREDENCIALES_INVALIDAS: {
    status: CodigoEstadoHTTP.NO_AUTORIZADO,
    msg: "Email o contrasena incorrectos",
  },
  USUARIO_INACTIVO: {
    status: CodigoEstadoHTTP.PROHIBIDO,
    msg: "La cuenta de usuario se encuentra inactiva",
  },
  ERROR_SERVIDOR,
};
