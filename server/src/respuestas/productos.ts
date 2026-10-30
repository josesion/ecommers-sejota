import { CodigoEstadoHTTP } from "../tipados/generico";

/** Entrada de reserva obligatoria en todo mapa. */
const ERROR_SERVIDOR = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
} as const;

export const MAPA_PRODUCTOS_LISTAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  PRODUCTOS_LISTED: {
    status: CodigoEstadoHTTP.OK,
    msg: "Productos listados",
  },
  NO_ACTIVAS: {
    status: CodigoEstadoHTTP.NO_ENCONTRADO,
    msg: "No hay productos que coincidan con el filtro",
  },
  ERROR_SERVIDOR,
};

export const MAPA_PRODUCTOS_CREAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  PRODUCTO_CREADO: {
    status: CodigoEstadoHTTP.CREADO,
    msg: "Producto creado",
  },
  SLUG_EXISTENTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "Ya existe un producto con ese slug",
  },
  CATEGORIA_NO_EXISTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "La categoria indicada no existe",
  },
  ERROR_SERVIDOR,
};

export const MAPA_PRODUCTOS_MODIFICAR: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  PRODUCTO_MODIFICADO: {
    status: CodigoEstadoHTTP.OK,
    msg: "Producto modificado",
  },
  PRODUCTO_SIN_CAMBIOS: {
    status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
    msg: "No hay campos para modificar",
  },
  SLUG_EXISTENTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "Ya existe un producto con ese slug",
  },
  CATEGORIA_NO_EXISTE: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "La categoria indicada no existe",
  },
  ERROR_SERVIDOR,
};

export const MAPA_PRODUCTOS_BAJA: Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
> = {
  PRODUCTO_DADO_DE_BAJA: {
    status: CodigoEstadoHTTP.OK,
    msg: "Producto dado de baja",
  },
  PRODUCTO_YA_DADO_DE_BAJA: {
    status: CodigoEstadoHTTP.CONFLICTO,
    msg: "El producto ya se encuentra dado de baja",
  },
  ERROR_SERVIDOR,
};
