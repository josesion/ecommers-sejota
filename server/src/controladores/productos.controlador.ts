import { Request, Response } from "express";
import { method as servicioProductos } from "../servicios/productos.servicios";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import {
  MAPA_PRODUCTOS_BAJA,
  MAPA_PRODUCTOS_CREAR,
  MAPA_PRODUCTOS_LISTAR,
  MAPA_PRODUCTOS_MODIFICAR,
} from "../respuestas/productos";
import {
  ProductoActualizarInputs,
  ProductoBajaInputs,
  ProductoCrearInputs,
  ProductoListadoInputs,
} from "../squemas/productos";
import { ProductoCreado, ProductoListado } from "../tipados/productos";

/**
 * Arma el payload de listado desde el query string.
 * Todo numero se castea con `Number()` antes de entrar al servicio.
 */
const armarFiltrosListado = (req: Request): ProductoListadoInputs => {
  const activoQuery = Number(req.query.activo ?? 1);
  const categoriaQuery =
    req.query.id_categoria !== undefined && String(req.query.id_categoria) !== ""
      ? Number(req.query.id_categoria)
      : undefined;

  return {
    pagina: Number(req.query.pagina ?? 1),
    limite: Number(req.query.limite ?? 10),
    busqueda: req.query.busqueda ? String(req.query.busqueda) : undefined,
    // El schema solo admite 0 o 1: cualquier otro valor cae al default 1.
    activo: activoQuery === 0 || activoQuery === 1 ? activoQuery : 1,
    id_categoria: categoriaQuery,
  };
};

/**
 * Lista productos con paginación, filtro de baja lógica y categoría.
 *
 * @async
 * @function listarProductos
 * @param {Request} req - Query con `pagina`, `limite`, `busqueda`, `activo` e `id_categoria`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example GET /api/productos?pagina=1&limite=10&activo=1&id_categoria=1
 */
const listarProductos = async (req: Request, res: Response) => {
  const dataListado = armarFiltrosListado(req);

  await handleControladores<ProductoListadoInputs, ProductoListado[]>(
    res,
    dataListado,
    servicioProductos.listar,
    MAPA_PRODUCTOS_LISTAR,
  );
};

/**
 * Crea un producto.
 *
 * @async
 * @function crearProducto
 * @param {Request} req - Body con `id_categoria`, `nombre`, `slug`, `precio_base` y opcionales.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example POST /api/productos { "id_categoria": 1, "nombre": "Vestido Midi", "slug": "vestido-midi", "precio_base": 89.50 }
 */
const crearProducto = async (req: Request, res: Response) => {
  const dataEntrada: ProductoCrearInputs = {
    id_categoria: Number(req.body.id_categoria),
    nombre: req.body.nombre,
    slug: req.body.slug,
    precio_base: Number(req.body.precio_base),
    precio_oferta:
      req.body.precio_oferta !== undefined && req.body.precio_oferta !== null
        ? Number(req.body.precio_oferta)
        : null,
    descripcion: req.body.descripcion ?? null,
    guia_talles: req.body.guia_talles ?? null,
  };

  await handleControladores<ProductoCrearInputs, ProductoCreado>(
    res,
    dataEntrada,
    servicioProductos.crear,
    MAPA_PRODUCTOS_CREAR,
  );
};

/**
 * Modifica un producto.
 *
 * @async
 * @function modificarProducto
 * @param {Request} req - Body con `id_producto` y los campos a cambiar.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example PUT /api/productos { "id_producto": 1, "nombre": "Vestido Midi Satinado", "precio_base": 99.99 }
 */
const modificarProducto = async (req: Request, res: Response) => {
  const dataEntrada: ProductoActualizarInputs = {
    id_producto: Number(req.body.id_producto),
    nombre: req.body.nombre,
    slug: req.body.slug,
    descripcion: req.body.descripcion,
    guia_talles: req.body.guia_talles,
    precio_base:
      req.body.precio_base !== undefined ? Number(req.body.precio_base) : undefined,
    // `undefined` = no tocar, `null` = borrar el valor explicitamente.
    precio_oferta:
      req.body.precio_oferta !== undefined
        ? req.body.precio_oferta === null
          ? null
          : Number(req.body.precio_oferta)
        : undefined,
    // El schema solo admite 0 o 1 en `activo`: otro valor se descarta.
    activo: (() => {
      const activoNumero =
        req.body.activo !== undefined ? Number(req.body.activo) : undefined;
      return activoNumero === 0 || activoNumero === 1 ? activoNumero : undefined;
    })(),
  };

  await handleControladores<ProductoActualizarInputs, unknown>(
    res,
    dataEntrada,
    servicioProductos.modificar,
    MAPA_PRODUCTOS_MODIFICAR,
  );
};

/**
 * Da de baja lógica a un producto (`activo = 0`).
 *
 * @async
 * @function bajaProducto
 * @param {Request} req - Body con `id_producto`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example DELETE /api/productos { "id_producto": 1 }
 */
const bajaProducto = async (req: Request, res: Response) => {
  const dataEntrada: ProductoBajaInputs = {
    id_producto: Number(req.body.id_producto),
  };

  await handleControladores<ProductoBajaInputs, { id_producto: number }>(
    res,
    dataEntrada,
    servicioProductos.baja,
    MAPA_PRODUCTOS_BAJA,
  );
};

export const method = {
  listar: tryCatch(listarProductos),
  crear: tryCatch(crearProducto),
  modificar: tryCatch(modificarProducto),
  baja: tryCatch(bajaProducto),
};
