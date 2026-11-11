import { CodigoEstadoHTTP } from "../tipados/generico";

/** Entrada de reserva obligatoria en todo mapa. */
const ERROR_SERVIDOR = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
} as const;

export const MAPA_ALTA_TALLES: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  ALTA_TALLE_OK: { status: CodigoEstadoHTTP.OK, msg: "El talle se creo correctamente." },
  TALLE_YA_EXISTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "El talle ya existe en el sistema",
  },
  ERROR_SERVIDOR,
};


export const MAPA_MOD_NOMBRE_TALLES: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  MOD_TALLE_OK: { status: CodigoEstadoHTTP.OK, msg: "El talle se modifico correctamente." },
  TALLE_YA_EXISTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "El talle ya existe en el sistema",
  },
  ERROR_SERVIDOR,
};

export const MAPA_MOD_ESTADO_TALLES: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  ESTADO_CAMBIADO: { 

    status: CodigoEstadoHTTP.OK, 
    msg: "El talle se modifico el estado correctamente." },

  ERROR_SERVIDOR,
};


export const MAPA_LISTADO_TALLES: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  LISTA_TALLES_OK: {   
    status: CodigoEstadoHTTP.OK, 
    msg: "Lista de talles obtenida correctamente." },

  SIN_LISTA_TALLES: {   
    status: CodigoEstadoHTTP.NO_ENCONTRADO, 
    msg: "Sin lista de talles disponibles." },

  ERROR_SERVIDOR,
};

export const MAPA_MOD_ORDEN_TALLES: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  ORDEN_TALLES_MODIFICADO: {   
    status: CodigoEstadoHTTP.OK, 
    msg: "El orden de los talles se modificó correctamente." },

ERROR_TRANSACCION: {
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error en la transacción al modificar el orden de los talles.",
  },

  ERROR_SERVIDOR,
};