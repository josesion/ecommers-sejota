import { Request, Response } from "express";
import { method as servicioCategorias } from "../servicios/categorias.servicios";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import {
  MAPA_CATEGORIAS_BAJA,
  MAPA_CATEGORIAS_CREAR,
  MAPA_CATEGORIAS_LISTAR,
  MAPA_CATEGORIAS_MODIFICAR,
} from "../respuestas/categorias";
import {
  CategoriaActualizarInputs,
  CategoriaBajaInputs,
  CategoriaCrearInputs,
  CategoriaListadoInputs,
} from "../squemas/categorias";
import { CategoriaCreada, CategoriaListado } from "../tipados/categorias";

/**
 * Arma el payload de listado desde el query string.
 * Todo numero se castea con `Number()` antes de entrar al servicio.
 */
const armarFiltrosListado = (req: Request): CategoriaListadoInputs => {
  const activoQuery = Number(req.query.activo ?? 1);
  return {
    pagina: Number(req.query.pagina ?? 1),
    limite: Number(req.query.limite ?? 10),
    busqueda: req.query.busqueda ? String(req.query.busqueda) : undefined,
    // El schema solo admite 0 o 1: cualquier otro valor cae al default 1.
    activo: activoQuery === 0 || activoQuery === 1 ? activoQuery : 1,
  };
};

/**
 * Lista categorías con paginación y filtro de baja lógica.
 *
 * @async
 * @function listarCategorias
 * @param {Request} req - Query con `pagina`, `limite`, `busqueda` y `activo`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example GET /api/categorias?pagina=1&limite=10&activo=1
 */
const listarCategorias = async (req: Request, res: Response) => {
  const dataListado = armarFiltrosListado(req);

  await handleControladores<CategoriaListadoInputs, CategoriaListado[]>(
    res,
    dataListado,
    servicioCategorias.listar,
    MAPA_CATEGORIAS_LISTAR,
  );
};

/**
 * Crea una categoría.
 *
 * @async
 * @function crearCategoria
 * @param {Request} req - Body con `nombre`, `slug` y `descripcion` opcional.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example POST /api/categorias { "nombre": "Electrónica", "slug": "electronica" }
 */
const crearCategoria = async (req: Request, res: Response) => {
  const dataEntrada: CategoriaCrearInputs = {
    nombre: req.body.nombre,
    slug: req.body.slug,
    descripcion: req.body.descripcion ?? null,
  };

  await handleControladores<CategoriaCrearInputs, CategoriaCreada>(
    res,
    dataEntrada,
    servicioCategorias.crear,
    MAPA_CATEGORIAS_CREAR,
  );
};

/**
 * Modifica una categoría.
 *
 * @async
 * @function modificarCategoria
 * @param {Request} req - Body con `id_categoria` y los campos a cambiar.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example PUT /api/categorias { "id_categoria": 1, "nombre": "Electrónica" }
 */
const modificarCategoria = async (req: Request, res: Response) => {
  // El schema solo admite 0 o 1 en `activo`: otro valor se descarta.
  const activoNumero =
    req.body.activo !== undefined ? Number(req.body.activo) : undefined;

  const dataEntrada: CategoriaActualizarInputs = {
    id_categoria: Number(req.body.id_categoria),
    nombre: req.body.nombre,
    slug: req.body.slug,
    descripcion: req.body.descripcion,
    activo:
      activoNumero === 0 || activoNumero === 1 ? activoNumero : undefined,
  };

  await handleControladores<CategoriaActualizarInputs, unknown>(
    res,
    dataEntrada,
    servicioCategorias.modificar,
    MAPA_CATEGORIAS_MODIFICAR,
  );
};

/**
 * Da de baja lógica a una categoría (`activo = 0`).
 *
 * @async
 * @function bajaCategoria
 * @param {Request} req - Body con `id_categoria`.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<void>}
 * @example DELETE /api/categorias { "id_categoria": 1 }
 */
const bajaCategoria = async (req: Request, res: Response) => {
  const dataEntrada: CategoriaBajaInputs = {
    id_categoria: Number(req.body.id_categoria),
  };

  await handleControladores<CategoriaBajaInputs, { id_categoria: number }>(
    res,
    dataEntrada,
    servicioCategorias.baja,
    MAPA_CATEGORIAS_BAJA,
  );
};

export const method = {
  listar: tryCatch(listarCategorias),
  crear: tryCatch(crearCategoria),
  modificar: tryCatch(modificarCategoria),
  baja: tryCatch(bajaCategoria),
};
