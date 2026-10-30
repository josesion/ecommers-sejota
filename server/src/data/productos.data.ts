import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import {
  ProductoActualizacionPayload,
  ProductoAltaPayload,
  ProductoExistente,
  ProductoListado,
} from "../tipados/productos";

/** Filtros del listado, ya validados por Zod en el servicio. */
export interface FiltrosListadoProductos {
  limite: number;
  offset: number;
  busqueda?: string;
  activo: number;
  id_categoria?: number;
}

/**
 * Verifica que la categoria exista. Es una FK (`ON DELETE RESTRICT`), así
 * que conviene cortar antes con un 409 legible en vez de dejar que MySQL
 * lance el error de constraint.
 *
 * OJO con la semántica del hook: `CATEGORIA_EXISTE` viene con
 * `error: true`, `CATEGORIA_NO_EXISTE` con `error: false`. El servicio
 * interpreta el `code`.
 *
 * @async
 * @function verificacionCategoria
 * @param {object} data - Solo necesita `id_categoria`.
 * @param {number} data.id_categoria - Categoria a verificar.
 * @returns {Promise<TipadoData<ProductoExistente>>} `CATEGORIA_EXISTE` o `CATEGORIA_NO_EXISTE`.
 */
const verificacionCategoria = async (data: {
  id_categoria: number;
}): Promise<TipadoData<ProductoExistente>> => {
  const slqEntidad = `SELECT id_categoria FROM categorias WHERE id_categoria = ?`;
  return buscarExistenteEntidad<ProductoExistente>({
    slqEntidad,
    valores: [data.id_categoria],
    entidad: "Categoria",
  });
};

/**
 * Verifica si ya existe un producto con ese slug.
 *
 * OJO con la semántica del hook: `PRODUCTO_EXISTE` viene con `error: true`
 * (fallo de la validación), `PRODUCTO_NO_EXISTE` con `error: false`.
 *
 * @async
 * @function verificacionSlug
 * @param {object} data - Solo necesita `slug`.
 * @param {string} data.slug - Slug a verificar.
 * @returns {Promise<TipadoData<ProductoExistente>>} `PRODUCTO_EXISTE` o `PRODUCTO_NO_EXISTE`.
 */
const verificacionSlug = async (data: {
  slug: string;
}): Promise<TipadoData<ProductoExistente>> => {
  const slqEntidad = `SELECT id_producto, slug FROM productos WHERE slug = ?`;
  return buscarExistenteEntidad<ProductoExistente>({
    slqEntidad,
    valores: [data.slug],
    entidad: "Producto",
  });
};

/**
 * Verifica si un producto está activo, es decir, apto para darse de baja.
 *
 * OJO con la semántica invertida del hook: con el filtro `activo = 1`,
 * `PRODUCTO_EXISTE` (`error: true`) significa que SÍ hay una fila activa,
 * y `PRODUCTO_NO_EXISTE` (`error: false`) que NO la hay (ya fue dado de
 * baja o no existe). Es el servicio quien interpreta el `code`.
 *
 * @async
 * @function verificacionActivo
 * @param {object} data - Solo necesita `id_producto`.
 * @param {number} data.id_producto - Producto a verificar.
 * @returns {Promise<TipadoData<ProductoExistente>>} `PRODUCTO_EXISTE` o `PRODUCTO_NO_EXISTE`.
 */
const verificacionActivo = async (data: {
  id_producto: number;
}): Promise<TipadoData<ProductoExistente>> => {
  const slqEntidad = `SELECT id_producto, slug FROM productos WHERE id_producto = ? AND activo = 1`;
  return buscarExistenteEntidad<ProductoExistente>({
    slqEntidad,
    valores: [data.id_producto],
    entidad: "Producto",
  });
};

/**
 * Inserta un producto.
 *
 * @async
 * @function alta
 * @param {ProductoAltaPayload} data - Datos del alta.
 * @returns {Promise<TipadoData<{ id_categoria: number } & { id?: number }>>} `PRODUCTOS_CREAR` con `data.id`.
 */
const alta = async (
  data: ProductoAltaPayload,
): Promise<
  TipadoData<
    { nombre: string; slug: string; id_categoria: number } & { id?: number }
  >
> => {
  const slqEntidad = `INSERT INTO productos (id_categoria, nombre, slug, descripcion,
                                              guia_talles, precio_base, precio_oferta)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
  return iudEntidad<{
    nombre: string;
    slug: string;
    id_categoria: number;
  }>({
    slqEntidad,
    valores: [
      data.id_categoria,
      data.nombre,
      data.slug,
      data.descripcion ?? null,
      data.guia_talles ?? null,
      data.precio_base,
      data.precio_oferta ?? null,
    ],
    entidad: "Productos",
    metodo: "CREAR",
    datosRetorno: {
      nombre: data.nombre,
      slug: data.slug,
      id_categoria: data.id_categoria,
    },
  });
};

/**
 * Lista productos filtrando por `activo` (baja lógica), `id_categoria`
 * (FK) y, opcionalmente, por texto en `nombre` o `slug`.
 *
 * `limit` y `offset` vienen casteados como enteros positivos por el schema
 * Zod del servicio, condición que el contrato exige para poder
 * interpolarlos en el string.
 *
 * @async
 * @function listado
 * @param {FiltrosListadoProductos} data - Filtros validados.
 * @param {number} pagina - Página actual, solo para el hook.
 * @returns {Promise<TipadoData<ProductoListado[]>>} `PRODUCTOS_LISTED` con paginación, o `NO_ACTIVE_PRODUCTOS`.
 */
const listado = async (
  data: FiltrosListadoProductos,
  pagina: number,
): Promise<TipadoData<ProductoListado[]>> => {
  const { limite, offset, busqueda, activo, id_categoria } = data;

  // El filtro de `activo` va primero: es el primer placeholder del WHERE.
  const condiciones: string[] = ["activo = ?"];
  const valores: unknown[] = [activo];

  if (id_categoria !== undefined) {
    condiciones.push("id_categoria = ?");
    valores.push(id_categoria);
  }
  if (busqueda) {
    condiciones.push("(nombre LIKE ? OR slug LIKE ?)");
    const like = `%${busqueda}%`;
    valores.push(like, like);
  }

  const where = condiciones.join(" AND ");
  const limiteSeguro = Math.trunc(limite);
  const offsetSeguro = Math.trunc(offset);

  const slqListado = `SELECT id_producto, id_categoria, nombre, slug, descripcion,
                             guia_talles, precio_base, precio_oferta, activo,
                             creado_en, actualizado_en,
                             COUNT(*) OVER() AS total_registros
                      FROM productos
                      WHERE ${where}
                      ORDER BY id_producto DESC
                      LIMIT ${limiteSeguro} OFFSET ${offsetSeguro}`;

  return listarEntidad<ProductoListado>({
    slqListado,
    valores,
    limit: limiteSeguro,
    pagina: String(pagina),
    entidad: "Productos",
    estado: activo === 0 ? "inactivos" : "activos",
  });
};

/**
 * Modifica un producto. Solo toca los campos presentes en el payload.
 *
 * @async
 * @function modificacion
 * @param {ProductoActualizacionPayload} data - Campos a cambiar más `id_producto`.
 * @returns {Promise<TipadoData<{ nombre?: string; slug?: string }>>} `PRODUCTOS_MODIFICAR`, o lanza `ClientError` 404 si no existe.
 */
const modificacion = async (
  data: ProductoActualizacionPayload,
): Promise<TipadoData<{ nombre?: string; slug?: string }>> => {
  const { id_producto, ...campos } = data;

  const sets: string[] = [];
  const valores: unknown[] = [];

  if (campos.nombre !== undefined) {
    sets.push("nombre = ?");
    valores.push(campos.nombre);
  }
  if (campos.slug !== undefined) {
    sets.push("slug = ?");
    valores.push(campos.slug);
  }
  if (campos.descripcion !== undefined) {
    sets.push("descripcion = ?");
    valores.push(campos.descripcion);
  }
  if (campos.guia_talles !== undefined) {
    sets.push("guia_talles = ?");
    valores.push(campos.guia_talles);
  }
  if (campos.precio_base !== undefined) {
    sets.push("precio_base = ?");
    valores.push(campos.precio_base);
  }
  if (campos.precio_oferta !== undefined) {
    sets.push("precio_oferta = ?");
    valores.push(campos.precio_oferta);
  }
  if (campos.activo !== undefined) {
    sets.push("activo = ?");
    valores.push(campos.activo);
  }

  const slqEntidad = `UPDATE productos SET ${sets.join(", ")} WHERE id_producto = ?`;
  valores.push(id_producto);

  // El eco solo informa los campos que realmente se tocaron: no se
  // devuelven strings vacíos por campos ausentes.
  const eco: { nombre?: string; slug?: string } = {};
  if (campos.nombre !== undefined) eco.nombre = campos.nombre;
  if (campos.slug !== undefined) eco.slug = campos.slug;

  return iudEntidad<{ nombre?: string; slug?: string }>({
    slqEntidad,
    valores,
    entidad: "Productos",
    metodo: "MODIFICAR",
    datosRetorno: eco,
  });
};

/**
 * Da de baja lógica a un producto: `activo = 0`. No borra la fila.
 *
 * @async
 * @function baja
 * @param {object} data - Solo necesita `id_producto`.
 * @param {number} data.id_producto - Producto a dar de baja.
 * @returns {Promise<TipadoData<{ id_producto: number }>>} `PRODUCTOS_MODIFICAR`, o lanza `ClientError` 404 si no está activo.
 */
const baja = async (data: {
  id_producto: number;
}): Promise<TipadoData<{ id_producto: number }>> => {
  const slqEntidad = `UPDATE productos
                      SET activo = 0, actualizado_en = CURRENT_TIMESTAMP
                      WHERE id_producto = ? AND activo = 1`;

  return iudEntidad<{ id_producto: number }>({
    slqEntidad,
    valores: [data.id_producto],
    entidad: "Productos",
    metodo: "MODIFICAR",
    datosRetorno: { id_producto: data.id_producto },
  });
};

export const method = {
  verificacionCategoria: tryCatchDatos(verificacionCategoria, "categoria", "f"),
  verificacionSlug: tryCatchDatos(verificacionSlug, "producto"),
  verificacionActivo: tryCatchDatos(verificacionActivo, "producto"),
  alta: tryCatchDatos(alta, "producto"),
  listado: tryCatchDatos(listado, "producto"),
  modificacion: tryCatchDatos(modificacion, "producto"),
  baja: tryCatchDatos(baja, "producto"),
};
