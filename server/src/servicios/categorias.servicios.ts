import { method as categoriasData } from "../data/categorias.data";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import { CategoriaCreada, CategoriaListado } from "../tipados/categorias";
import {
  CategoriaActualizarInputs,
  CategoriaActualizarSchema,
  CategoriaBajaInputs,
  CategoriaBajaSchema,
  CategoriaCrearInputs,
  CategoriaCrearSchema,
  CategoriaListadoInputs,
  CategoriaListadoSchema,
} from "../squemas/categorias";

/**
 * Lista categorías filtrando por baja lógica (`activo`) y texto.
 *
 * @async
 * @function listar
 * @param {CategoriaListadoInputs} dataEntrada - Filtros crudos del controlador.
 * @returns {Promise<TipadoData<CategoriaListado[]>>} `CATEGORIAS_LISTED` o `NO_ACTIVAS`.
 */
const listar = async (
  dataEntrada: CategoriaListadoInputs,
): Promise<TipadoData<CategoriaListado[]>> => {
  const dataValida = CategoriaListadoSchema.parse(dataEntrada);

  const offset = (dataValida.pagina - 1) * dataValida.limite;

  const resultado = await categoriasData.listado(
    {
      limite: dataValida.limite,
      offset,
      busqueda: dataValida.busqueda,
      activo: dataValida.activo,
    },
    dataValida.pagina,
  );

  if (resultado.code === "NO_ACTIVE_CATEGORIAS") {
    return {
      error: true,
      message: "No hay categorías que coincidan con el filtro",
      data: [],
      paginacion: {
        pagina: dataValida.pagina,
        limite: dataValida.limite,
        contadorPagina: 0,
        totalRegistros: 0,
      },
      code: "NO_ACTIVAS",
    };
  }

  if (resultado.code === "CATEGORIAS_LISTED") {
    return {
      error: false,
      message: "Categorías listadas",
      data: resultado.data,
      paginacion: resultado.paginacion,
      code: "CATEGORIAS_LISTED",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, listar categorías.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Crea una categoría. Corta si el slug ya existe.
 *
 * @async
 * @function crear
 * @param {CategoriaCrearInputs} dataEntrada - Datos crudos del controlador.
 * @returns {Promise<TipadoData<CategoriaCreada>>} `CATEGORIA_CREADA` o `SLUG_EXISTENTE`.
 */
const crear = async (
  dataEntrada: CategoriaCrearInputs,
): Promise<TipadoData<CategoriaCreada>> => {
  const dataValida = CategoriaCrearSchema.parse(dataEntrada);

  const existente = await categoriasData.verificacionSlug({
    slug: dataValida.slug,
  });

  if (existente.code === "CATEGORIA_EXISTE") {
    return {
      error: true,
      message: "Ya existe una categoría con ese slug",
      code: "SLUG_EXISTENTE",
    };
  }

  const resultado = await categoriasData.alta({
    nombre: dataValida.nombre,
    slug: dataValida.slug,
    descripcion: dataValida.descripcion ?? null,
  });

  if (resultado.code === "CATEGORIAS_CREAR") {
    return {
      error: false,
      message: "Categoría creada",
      data: resultado.data as CategoriaCreada,
      code: "CATEGORIA_CREADA",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, crear categoría.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Modifica una categoría. Corta si no hay campos, o si el slug nuevo ya
 * existe en otra categoría.
 *
 * @async
 * @function modificar
 * @param {CategoriaActualizarInputs} dataEntrada - Datos crudos del controlador.
 * @returns {Promise<TipadoData<unknown>>} `CATEGORIA_MODIFICADA`, `CATEGORIA_SIN_CAMBIOS` o `SLUG_EXISTENTE`.
 */
const modificar = async (
  dataEntrada: CategoriaActualizarInputs,
): Promise<TipadoData<unknown>> => {
  const dataValida = CategoriaActualizarSchema.parse(dataEntrada);

  const { id_categoria, ...campos } = dataValida;
  const tieneCampos = Object.values(campos).some(
    (valor) => valor !== undefined,
  );

  if (!tieneCampos) {
    return {
      error: true,
      message: "No hay campos para modificar",
      code: "CATEGORIA_SIN_CAMBIOS",
    };
  }

  if (campos.slug !== undefined) {
    const existente = await categoriasData.verificacionSlug({
      slug: campos.slug,
    });

    if (
      existente.code === "CATEGORIA_EXISTE" &&
      existente.data?.id_categoria !== id_categoria
    ) {
      return {
        error: true,
        message: "Ya existe una categoría con ese slug",
        code: "SLUG_EXISTENTE",
      };
    }
  }

  const resultado = await categoriasData.modificacion({
    id_categoria,
    ...campos,
  });

  if (resultado.code === "CATEGORIAS_MODIFICAR") {
    return {
      error: false,
      message: "Categoría modificada",
      data: resultado.data,
      code: "CATEGORIA_MODIFICADA",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, modificar categoría.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Da de baja lógica a una categoría (`activo = 0`). No borra la fila.
 *
 * @async
 * @function baja
 * @param {CategoriaBajaInputs} dataEntrada - Solo `id_categoria`.
 * @returns {Promise<TipadoData<{ id_categoria: number }>>} `CATEGORIA_DADA_DE_BAJA` o `CATEGORIA_YA_DADO_DE_BAJA`.
 */
const baja = async (
  dataEntrada: CategoriaBajaInputs,
): Promise<TipadoData<{ id_categoria: number }>> => {
  const dataValida = CategoriaBajaSchema.parse(dataEntrada);

  const categoria = await categoriasData.busquedaCategoria({
    id_categoria: dataValida.id_categoria
  });

  if ( categoria.code === "CATEGORIA_NO_EXISTE"){
      return {
        error : true,
        message : "No existe esta Categoria.",
        code : "NO_EXISTE_CATEGORIA"
      }
  };

  if ( categoria.code === "CATEGORIA_EXISTE"){
      const estado =  categoria.data?.activo === 1 ? 0 : 1;
      const mensaje = categoria.data?.activo === 1 
            ? "Categoría dada de baja"
            : "Categoría dada de alta"
      const resultado = await categoriasData.estadoCategoria({
        id_categoria: dataValida.id_categoria, activo : estado
      });

      if (resultado.code === "CATEGORIAS_MODIFICAR") {
        return {
          error: false,
          message: mensaje,
          data: resultado.data,
          code: "CATEGORIA_DADA_DE_BAJA",
        };
      }; 
  };

  return {
    error: true,
    message: "Error en el servidor, dar de baja categoría.",
    code: "ERROR_SERVIDOR",
  };
};

export const method = {
  listar: tryCatchDatos(listar, "categoria", "f"),
  crear: tryCatchDatos(crear, "categoria", "f"),
  modificar: tryCatchDatos(modificar, "categoria", "f"),
  baja: tryCatchDatos(baja, "categoria", "f"),
};
