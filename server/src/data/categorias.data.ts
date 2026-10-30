import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import {
  CategoriaActualizacionPayload,
  CategoriaAltaPayload,
  CategoriaExistente,
  CategoriaListado,
} from "../tipados/categorias";

/** Filtros del listado, ya validados por Zod en el servicio. */
export interface FiltrosListadoCategorias {
  limite: number;
  offset: number;
  busqueda?: string;
  activo: number;
}

/**
 * Verifica si ya existe una categoría con ese slug.
 *
 * OJO con la semántica del hook: `CATEGORIA_EXISTE` viene con `error: true`
 * (es un fallo de la validación), `CATEGORIA_NO_EXISTE` con `error: false`.
 *
 * @async
 * @function verificacionSlug
 * @param {object} data - Solo necesita `slug`.
 * @param {string} data.slug - Slug a verificar.
 * @returns {Promise<TipadoData<CategoriaExistente>>} `CATEGORIA_EXISTE` o `CATEGORIA_NO_EXISTE`.
 */
const verificacionSlug = async (data: {
  slug: string;
}): Promise<TipadoData<CategoriaExistente>> => {
  const slqEntidad = `SELECT id_categoria, slug FROM categorias WHERE slug = ?`;
  return buscarExistenteEntidad<CategoriaExistente>({
    slqEntidad,
    valores: [data.slug],
    entidad: "Categoria",
  });
};

/**
 * Verifica si una categoría está activa, es decir, apta para darse de baja.
 *
 * OJO con la semántica invertida del hook: con el filtro `activo = 1`,
 * `CATEGORIA_EXISTE` (`error: true`) significa que SÍ hay una fila activa,
 * y `CATEGORIA_NO_EXISTE` (`error: false`) que NO la hay (ya fue dada de
 * baja o no existe). Es el servicio quien interpreta el `code`.
 *
 * @async
 * @function verificacionActiva
 * @param {object} data - Solo necesita `id_categoria`.
 * @param {number} data.id_categoria - Categoría a verificar.
 * @returns {Promise<TipadoData<CategoriaExistente>>} `CATEGORIA_EXISTE` o `CATEGORIA_NO_EXISTE`.
 */
const verificacionActiva = async (data: {
  id_categoria: number;
}): Promise<TipadoData<CategoriaExistente>> => {
  const slqEntidad = `SELECT id_categoria, slug FROM categorias WHERE id_categoria = ? AND activo = 1`;
  return buscarExistenteEntidad<CategoriaExistente>({
    slqEntidad,
    valores: [data.id_categoria],
    entidad: "Categoria",
  });
};

/**
 * Inserta una categoría.
 *
 * @async
 * @function alta
 * @param {CategoriaAltaPayload} data - Datos del alta.
 * @returns {Promise<TipadoData<CategoriaCreada>>} `CATEGORIAS_CREAR` con `data.id`.
 */
const alta = async (
  data: CategoriaAltaPayload,
): Promise<
  TipadoData<{ nombre: string; slug: string } & { id?: number }>
> => {
  const slqEntidad = `INSERT INTO categorias (nombre, slug, descripcion)
                      VALUES (?, ?, ?)`;
  return iudEntidad<{ nombre: string; slug: string }>({
    slqEntidad,
    valores: [data.nombre, data.slug, data.descripcion ?? null],
    entidad: "Categorias",
    metodo: "CREAR",
    datosRetorno: { nombre: data.nombre, slug: data.slug },
  });
};

/**
 * Lista categorías filtrando por `activo` (baja lógica) y, opcionalmente,
 * por texto en `nombre` o `slug`.
 *
 * `limit` y `offset` vienen casteados como enteros positivos por el schema
 * Zod del servicio, condición que el contrato exige para poder
 * interpolarlos en el string.
 *
 * @async
 * @function listado
 * @param {FiltrosListadoCategorias} data - Filtros validados.
 * @param {number} pagina - Página actual, solo para el hook.
 * @returns {Promise<TipadoData<CategoriaListado[]>>} `CATEGORIAS_LISTED` con paginación, o `NO_ACTIVE_CATEGORIAS`.
 */
const listado = async (
  data: FiltrosListadoCategorias,
  pagina: number,
): Promise<TipadoData<CategoriaListado[]>> => {
  const { limite, offset, busqueda, activo } = data;

  // El filtro de `activo` va primero: es el primer placeholder del WHERE.
  const condiciones: string[] = ["activo = ?"];
  const valores: unknown[] = [activo];

  if (busqueda) {
    condiciones.push("(nombre LIKE ? OR slug LIKE ?)");
    const like = `%${busqueda}%`;
    valores.push(like, like);
  }

  const where = condiciones.join(" AND ");
  const limiteSeguro = Math.trunc(limite);
  const offsetSeguro = Math.trunc(offset);

  const slqListado = `SELECT id_categoria, nombre, slug, descripcion, activo,
                             creado_en, actualizado_en,
                             COUNT(*) OVER() AS total_registros
                      FROM categorias
                      WHERE ${where}
                      ORDER BY id_categoria DESC
                      LIMIT ${limiteSeguro} OFFSET ${offsetSeguro}`;

  return listarEntidad<CategoriaListado>({
    slqListado,
    valores,
    limit: limiteSeguro,
    pagina: String(pagina),
    entidad: "Categorias",
    estado: activo === 0 ? "inactivas" : "activas",
  });
};

/**
 * Modifica una categoría. Solo toca los campos presentes en el payload.
 *
 * @async
 * @function modificacion
 * @param {CategoriaActualizacionPayload} data - Campos a cambiar más `id_categoria`.
 * @returns {Promise<TipadoData<CategoriaCreada>>} `CATEGORIAS_MODIFICAR`, o lanza `ClientError` 404 si no existe.
 */
const modificacion = async (
  data: CategoriaActualizacionPayload,
): Promise<
  TipadoData<{ nombre?: string; slug?: string } & { id?: number }>
> => {
  const { id_categoria, ...campos } = data;

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
  if (campos.activo !== undefined) {
    sets.push("activo = ?");
    valores.push(campos.activo);
  }

  const slqEntidad = `UPDATE categorias SET ${sets.join(", ")} WHERE id_categoria = ?`;
  valores.push(id_categoria);

  // El eco solo informa los campos que realmente se tocaron: no se
  // devuelven strings vacíos por campos ausentes.
  const eco: { nombre?: string; slug?: string } = {};
  if (campos.nombre !== undefined) eco.nombre = campos.nombre;
  if (campos.slug !== undefined) eco.slug = campos.slug;

  return iudEntidad<{ nombre?: string; slug?: string }>({
    slqEntidad,
    valores,
    entidad: "Categorias",
    metodo: "MODIFICAR",
    datosRetorno: eco,
  });
};

/**
 * Da de baja lógica a una categoría: `activo = 0`. No borra la fila.
 *
 * @async
 * @function baja
 * @param {object} data - Solo necesita `id_categoria`.
 * @param {number} data.id_categoria - Categoría a dar de baja.
 * @returns {Promise<TipadoData<{ id_categoria: number }>>} `CATEGORIAS_MODIFICAR`, o lanza `ClientError` 404 si no está activa.
 */
const baja = async (data: {
  id_categoria: number;
}): Promise<TipadoData<{ id_categoria: number }>> => {
  const slqEntidad = `UPDATE categorias
                      SET activo = 0, actualizado_en = CURRENT_TIMESTAMP
                      WHERE id_categoria = ? AND activo = 1`;

  return iudEntidad<{ id_categoria: number }>({
    slqEntidad,
    valores: [data.id_categoria],
    entidad: "Categorias",
    metodo: "MODIFICAR",
    datosRetorno: { id_categoria: data.id_categoria },
  });
};

export const method = {
  verificacionSlug: tryCatchDatos(verificacionSlug, "categoria", "f"),
  verificacionActiva: tryCatchDatos(verificacionActiva, "categoria", "f"),
  alta: tryCatchDatos(alta, "categoria", "f"),
  listado: tryCatchDatos(listado, "categoria", "f"),
  modificacion: tryCatchDatos(modificacion, "categoria", "f"),
  baja: tryCatchDatos(baja, "categoria", "f"),
};
