import { CodigoEstadoHTTP } from "../tipados/generico";

/** Entrada de reserva obligatoria en todo mapa. */
const ERROR_SERVIDOR = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
} as const;

export const MAPA_USUARIOS_LISTAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  LISTADO_OK: { status: CodigoEstadoHTTP.OK, msg: "Usuarios listados" },
  LISTADO_VACIO: {
    status: CodigoEstadoHTTP.NO_ENCONTRADO,
    msg: "No hay usuarios que coincidan con el filtro",
  },
  ERROR_SERVIDOR,
};

export const MAPA_USUARIOS_CREAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  USUARIO_CREADO: { status: CodigoEstadoHTTP.CREADO, msg: "Usuario creado" },
  USUARIO_EXISTENTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "Este usuario ya se encuentra registrado",
  },
  ERROR_SERVIDOR,
};

export const MAPA_USUARIOS_MODIFICAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  USUARIO_MODIFICADO: {
    status: CodigoEstadoHTTP.OK,
    msg: "Usuario modificado",
  },
  USUARIO_SIN_CAMBIOS: {
    status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
    msg: "No hay campos para modificar",
  },
  USUARIO_EXISTENTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "Este usuario ya se encuentra registrado",
  },
  ERROR_SERVIDOR,
};

export const MAPA_USUARIOS_BAJA: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  USUARIO_DADO_DE_BAJA: {
    status: CodigoEstadoHTTP.OK,
    msg: "Usuario dado de baja",
  },
  USUARIO_YA_DADO_DE_BAJA: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "El usuario ya se encuentra dado de baja",
  },
  ERROR_SERVIDOR,
};
