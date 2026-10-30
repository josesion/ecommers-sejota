import { CodigoEstadoHTTP } from "../tipados/generico";

/** Entrada de reserva obligatoria en todo mapa. */
const ERROR_SERVIDOR = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
} as const;

export const MAPA_CATEGORIAS_LISTAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  CATEGORIAS_LISTED: {
    status: CodigoEstadoHTTP.OK,
    msg: "Categorías listadas",
  },
  NO_ACTIVAS: {
    status: CodigoEstadoHTTP.NO_ENCONTRADO,
    msg: "No hay categorías que coincidan con el filtro",
  },
  ERROR_SERVIDOR,
};

export const MAPA_CATEGORIAS_CREAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  CATEGORIA_CREADA: {
    status: CodigoEstadoHTTP.CREADO,
    msg: "Categoría creada",
  },
  SLUG_EXISTENTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "Ya existe una categoría con ese slug",
  },
  ERROR_SERVIDOR,
};

export const MAPA_CATEGORIAS_MODIFICAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  CATEGORIA_MODIFICADA: {
    status: CodigoEstadoHTTP.OK,
    msg: "Categoría modificada",
  },
  CATEGORIA_SIN_CAMBIOS: {
    status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
    msg: "No hay campos para modificar",
  },
  SLUG_EXISTENTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "Ya existe una categoría con ese slug",
  },
  ERROR_SERVIDOR,
};

export const MAPA_CATEGORIAS_BAJA: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  CATEGORIA_DADA_DE_BAJA: {
    status: CodigoEstadoHTTP.OK,
    msg: "Categoría dada de baja",
  },
  CATEGORIA_YA_DADO_DE_BAJA: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "La categoría ya se encuentra dada de baja",
  },
  ERROR_SERVIDOR,
};
