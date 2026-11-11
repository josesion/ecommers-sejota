import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
} as const;

export const MAPA_ALTA_COLORES: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
  ALTA_COLOR_OK: { status: CodigoEstadoHTTP.CREADO, msg: "El color se creó correctamente." },
  COLOR_YA_EXISTE: { status: CodigoEstadoHTTP.CONFLICTO, msg: "El color ya existe en el sistema." },
  ERROR_SERVIDOR,
};

export const MAPA_MOD_COLORES: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
  MOD_COLOR_OK: { status: CodigoEstadoHTTP.OK, msg: "El color se modificó correctamente." },
  COLOR_YA_EXISTE: { status: CodigoEstadoHTTP.CONFLICTO, msg: "El color ya existe en el sistema." },
  COLOR_SIN_CAMBIOS: { status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA, msg: "No hay campos para modificar." },
  ERROR_SERVIDOR,
};

export const MAPA_MOD_ESTADO_COLORES: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
  ESTADO_COLOR_CAMBIADO: { status: CodigoEstadoHTTP.OK, msg: "El estado del color se modificó correctamente." },
  ERROR_SERVIDOR,
};

export const MAPA_LISTADO_COLORES: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
  LISTA_COLORES_OK: { status: CodigoEstadoHTTP.OK, msg: "Lista de colores obtenida correctamente." },
  SIN_LISTA_COLORES: { status: CodigoEstadoHTTP.NO_ENCONTRADO, msg: "Sin lista de colores disponibles." },
  ERROR_SERVIDOR,
};
